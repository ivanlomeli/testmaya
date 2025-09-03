// backend/src/models.rs
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use sqlx::FromRow;
use validator::Validate;

// Modelo de Usuario para la Base de Datos
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password_hash: String,
    pub user_type: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

// Información del usuario para las respuestas (sin contraseña)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserInfo {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub user_type: String,
}

// Request para registro
#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(length(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres"))]
    pub first_name: String,
    
    #[validate(length(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres"))]
    pub last_name: String,
    
    #[validate(email(message = "Debe ser un email válido"))]
    pub email: String,
    
    #[validate(length(min = 6, message = "La contraseña debe tener al menos 6 caracteres"))]
    pub password: String,
}

// Request para login
#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email(message = "Debe ser un email válido"))]
    pub email: String,
    
    #[validate(length(min = 1, message = "La contraseña es requerida"))]
    pub password: String,
}

// Respuesta de autenticación
#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub message: String,
    pub token: String,
    pub user: UserInfo,
}

// Claims para JWT
#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    pub user_id: i32,
    pub email: String,
    pub user_type: String,
    pub exp: usize, // Tiempo de expiración
}

// === MODELOS PARA BOOKING ===

#[derive(Debug, Deserialize, Validate)]
pub struct CreateBookingRequest {
    pub hotel_id: i32,
    
    #[validate(custom = "validate_future_date")]
    pub check_in: chrono::NaiveDate,
    
    #[validate(custom = "validate_checkout_after_checkin")]
    pub check_out: chrono::NaiveDate,
    
    #[validate(range(min = 1, max = 10, message = "El número de huéspedes debe estar entre 1 y 10"))]
    pub guests: i32,
    
    #[validate(range(min = 1, max = 5, message = "El número de habitaciones debe estar entre 1 y 5"))]
    pub rooms: i32,
    
    pub special_requests: Option<String>,
    pub addon_services: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBookingStatusRequest {
    pub status: Option<String>,
    pub cancellation_reason: Option<String>,
}

// Funciones de validación personalizadas
fn validate_future_date(date: &chrono::NaiveDate) -> Result<(), validator::ValidationError> {
    if *date <= chrono::Utc::now().naive_utc().date() {
        return Err(validator::ValidationError::new("La fecha debe ser futura"));
    }
    Ok(())
}

fn validate_checkout_after_checkin(checkout: &chrono::NaiveDate) -> Result<(), validator::ValidationError> {
    // Esta validación se hará en el handler ya que necesitamos comparar con check_in
    Ok(())
}