use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use serde_json::json;
use crate::models::UserInfo;

pub async fn verify_hotel_ownership(pool: &PgPool, hotel_id: i32, user: &UserInfo) -> Result<bool, sqlx::Error> {
    // Si es admin, puede acceder a todo
    if user.user_type == "admin" {
        return Ok(true);
    }
    
    // Verificar si el usuario es dueño del hotel
    let result = sqlx::query!(
        "SELECT owner_id FROM hotels WHERE id = $1",
        hotel_id
    )
    .fetch_optional(pool)
    .await?;
    
    match result {
        Some(hotel) => Ok(hotel.owner_id == Some(user.id)),
        None => Ok(false), // Hotel no existe
    }
}

pub async fn get_hotels(pool: web::Data<PgPool>) -> Result<HttpResponse> {
    let hotels = sqlx::query!(
        "SELECT id, name, location, address, price FROM hotels WHERE status = 'approved'"
    )
    .fetch_all(pool.get_ref())
    .await;

    match hotels {
        Ok(hotel_list) => {
            let hotels_json: Vec<serde_json::Value> = hotel_list
                .into_iter()
                .map(|h| json!({
                    "id": h.id,
                    "name": h.name,
                    "location": h.location,
                    "address": h.address,
                    "price": h.price
                }))
                .collect();
            
            Ok(HttpResponse::Ok().json(hotels_json))
        }
        Err(e) => {
            println!("💥 [HOTELS] Error: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "No se pudieron obtener los hoteles"
            })))
        }
    }
}