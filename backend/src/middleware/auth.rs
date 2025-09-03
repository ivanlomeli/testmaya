// backend/src/middleware/auth.rs
use actix_web::{dev, Error, FromRequest, HttpRequest};
use actix_web::error::ErrorUnauthorized;
use futures_util::future::{err, ok, Ready};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde_json::json;

use crate::models::{JwtClaims, UserInfo};

impl FromRequest for UserInfo {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _: &mut dev::Payload) -> Self::Future {
        println!("🔐 [MIDDLEWARE] Verificando autenticación...");

        // Obtener el header Authorization
        let auth_header = match req.headers().get("Authorization") {
            Some(header) => match header.to_str() {
                Ok(header_str) => {
                    println!("📋 [MIDDLEWARE] Header Authorization encontrado");
                    header_str
                }
                Err(_) => {
                    println!("❌ [MIDDLEWARE] Header Authorization con formato inválido");
                    return err(ErrorUnauthorized(json!({
                        "error": "Header Authorization inválido"
                    })));
                }
            },
            None => {
                println!("❌ [MIDDLEWARE] Header Authorization no encontrado");
                return err(ErrorUnauthorized(json!({
                    "error": "Token de autenticación requerido"
                })));
            }
        };

        // Extraer el token (formato: "Bearer TOKEN")
        let token = if auth_header.starts_with("Bearer ") {
            &auth_header[7..] // Remover "Bearer "
        } else {
            println!("❌ [MIDDLEWARE] Formato de token inválido (debe ser 'Bearer TOKEN')");
            return err(ErrorUnauthorized(json!({
                "error": "Formato de token inválido. Use: Bearer <token>"
            })));
        };

        println!("🎫 [MIDDLEWARE] Token extraído: {}...", &token[..std::cmp::min(20, token.len())]);

        // Obtener la clave secreta del JWT
        let secret = match std::env::var("JWT_SECRET_KEY") {
            Ok(secret) => secret,
            Err(_) => {
                println!("⚠️ [MIDDLEWARE] JWT_SECRET_KEY no encontrado en .env, usando valor por defecto");
                "esta_es_una_clave_diferente_para_la_copia".to_string()
            }
        };

        // Configurar validación del JWT
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true; // Validar expiración
        
        // Decodificar y validar el token
        match decode::<JwtClaims>(
            token,
            &DecodingKey::from_secret(secret.as_ref()),
            &validation,
        ) {
            Ok(token_data) => {
                println!("✅ [MIDDLEWARE] Token válido para usuario ID: {}", token_data.claims.user_id);
                
                let user_info = UserInfo {
                    id: token_data.claims.user_id,
                    first_name: "".to_string(), // Estos campos se pueden obtener de la BD si es necesario
                    last_name: "".to_string(),
                    email: token_data.claims.email,
                    user_type: token_data.claims.user_type,
                };
                
                ok(user_info)
            }
            Err(e) => {
                println!("❌ [MIDDLEWARE] Token inválido: {:?}", e);
                
                let error_message = match e.kind() {
                    jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
                        "Token expirado. Por favor, inicia sesión nuevamente."
                    }
                    jsonwebtoken::errors::ErrorKind::InvalidToken => {
                        "Token inválido"
                    }
                    jsonwebtoken::errors::ErrorKind::InvalidSignature => {
                        "Firma del token inválida"
                    }
                    _ => "Token de autenticación inválido"
                };
                
                err(ErrorUnauthorized(json!({
                    "error": error_message,
                    "details": e.to_string()
                })))
            }
        }
    }
}