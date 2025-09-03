// backend/src/handlers/auth.rs
use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use serde_json::json;
use jsonwebtoken::{encode, Header, EncodingKey};
use chrono::{Utc, Duration};
use validator::Validate;

use crate::models::*;

// Función auxiliar para hashear contraseñas (simplificado para demo)
// En producción deberías usar bcrypt o argon2
fn hash_password(password: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let mut hasher = DefaultHasher::new();
    password.hash(&mut hasher);
    format!("hash_{}", hasher.finish())
}

// Función auxiliar para verificar contraseñas
fn verify_password(password: &str, hash: &str) -> bool {
    hash_password(password) == hash
}

// Función auxiliar para crear JWT
fn create_jwt(user: &UserInfo, secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(7)) // Token válido por 7 días
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = JwtClaims {
        user_id: user.id,
        email: user.email.clone(),
        user_type: user.user_type.clone(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

pub async fn register(
    pool: web::Data<PgPool>,
    register_req: web::Json<RegisterRequest>,
) -> Result<HttpResponse> {
    println!("🔐 [AUTH] Procesando registro para: {}", register_req.email);

    // Validar datos de entrada
    if let Err(errors) = register_req.validate() {
        println!("❌ [AUTH] Errores de validación: {:?}", errors);
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Datos inválidos",
            "details": errors.to_string()
        })));
    }

    // Verificar si el usuario ya existe
    let existing_user = sqlx::query!(
        "SELECT id FROM users WHERE email = $1",
        register_req.email
    )
    .fetch_optional(pool.get_ref())
    .await;

    match existing_user {
        Ok(Some(_)) => {
            println!("⚠️ [AUTH] Email ya registrado: {}", register_req.email);
            return Ok(HttpResponse::Conflict().json(json!({
                "error": "Este email ya está registrado"
            })));
        }
        Err(e) => {
            println!("💥 [AUTH] Error verificando usuario existente: {}", e);
            return Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error interno del servidor",
                "details": e.to_string()
            })));
        }
        Ok(None) => {
            println!("✅ [AUTH] Email disponible, creando usuario...");
        }
    }

    // Hashear contraseña
    let password_hash = hash_password(&register_req.password);

    // Crear usuario en la base de datos
    let user_result = sqlx::query!(
        r#"
        INSERT INTO users (first_name, last_name, email, password_hash, user_type) 
        VALUES ($1, $2, $3, $4, 'customer') 
        RETURNING id, first_name, last_name, email, user_type, created_at
        "#,
        register_req.first_name,
        register_req.last_name,
        register_req.email,
        password_hash
    )
    .fetch_one(pool.get_ref())
    .await;

    match user_result {
        Ok(user_record) => {
            println!("✅ [AUTH] Usuario creado exitosamente con ID: {}", user_record.id);

            let user_info = UserInfo {
                id: user_record.id,
                first_name: user_record.first_name,
                last_name: user_record.last_name,
                email: user_record.email,
                user_type: user_record.user_type,
            };

            // Generar JWT
            let secret = std::env::var("JWT_SECRET_KEY").unwrap_or_else(|_| {
                println!("⚠️ [AUTH] JWT_SECRET_KEY no encontrado en .env, usando valor por defecto");
                "esta_es_una_clave_diferente_para_la_copia".to_string()
            });

            match create_jwt(&user_info, &secret) {
                Ok(token) => {
                    println!("🎫 [AUTH] JWT generado exitosamente");

                    let response = AuthResponse {
                        message: "Usuario registrado exitosamente".to_string(),
                        token,
                        user: user_info,
                    };

                    Ok(HttpResponse::Created().json(response))
                }
                Err(e) => {
                    println!("💥 [AUTH] Error generando JWT: {}", e);
                    Ok(HttpResponse::InternalServerError().json(json!({
                        "error": "Error generando token de autenticación",
                        "details": e.to_string()
                    })))
                }
            }
        }
        Err(e) => {
            println!("💥 [AUTH] Error creando usuario en BD: {}", e);
            
            let error_message = if e.to_string().contains("unique") {
                "Este email ya está registrado"
            } else {
                "Error al crear la cuenta"
            };

            Ok(HttpResponse::InternalServerError().json(json!({
                "error": error_message,
                "details": e.to_string()
            })))
        }
    }
}

pub async fn login(
    pool: web::Data<PgPool>,
    login_req: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    println!("🔐 [AUTH] Procesando login para: {}", login_req.email);

    // Validar datos de entrada
    if let Err(errors) = login_req.validate() {
        println!("❌ [AUTH] Errores de validación: {:?}", errors);
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Datos inválidos",
            "details": errors.to_string()
        })));
    }

    // Buscar usuario en la base de datos
    let user_result = sqlx::query_as!(
        User,
        "SELECT id, first_name, last_name, email, password_hash, user_type, created_at, updated_at FROM users WHERE email = $1",
        login_req.email
    )
    .fetch_optional(pool.get_ref())
    .await;

    match user_result {
        Ok(Some(user)) => {
            println!("👤 [AUTH] Usuario encontrado: {}", user.email);

            // Verificar contraseña
            if verify_password(&login_req.password, &user.password_hash) {
                println!("✅ [AUTH] Contraseña correcta");

                let user_info = UserInfo {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    user_type: user.user_type,
                };

                // Generar JWT
                let secret = std::env::var("JWT_SECRET_KEY").unwrap_or_else(|_| {
                    println!("⚠️ [AUTH] JWT_SECRET_KEY no encontrado en .env, usando valor por defecto");
                    "esta_es_una_clave_diferente_para_la_copia".to_string()
                });

                match create_jwt(&user_info, &secret) {
                    Ok(token) => {
                        println!("🎫 [AUTH] Login exitoso, JWT generado");

                        let response = AuthResponse {
                            message: "Login exitoso".to_string(),
                            token,
                            user: user_info,
                        };

                        Ok(HttpResponse::Ok().json(response))
                    }
                    Err(e) => {
                        println!("💥 [AUTH] Error generando JWT: {}", e);
                        Ok(HttpResponse::InternalServerError().json(json!({
                            "error": "Error generando token de autenticación",
                            "details": e.to_string()
                        })))
                    }
                }
            } else {
                println!("❌ [AUTH] Contraseña incorrecta");
                Ok(HttpResponse::Unauthorized().json(json!({
                    "error": "Email o contraseña incorrectos"
                })))
            }
        }
        Ok(None) => {
            println!("❌ [AUTH] Usuario no encontrado: {}", login_req.email);
            Ok(HttpResponse::Unauthorized().json(json!({
                "error": "Email o contraseña incorrectos"
            })))
        }
        Err(e) => {
            println!("💥 [AUTH] Error buscando usuario: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error interno del servidor",
                "details": e.to_string()
            })))
        }
    }
}

pub async fn me(user: UserInfo) -> Result<HttpResponse> {
    println!("👤 [AUTH] Obteniendo información del usuario: {}", user.email);
    
    Ok(HttpResponse::Ok().json(json!({
        "user": user
    })))
}