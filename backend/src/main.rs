// backend/src/main.rs
use actix_web::{web, App, HttpServer, HttpResponse};
use actix_cors::Cors;
use sqlx::{postgres::PgPoolOptions, PgPool};
use dotenv::dotenv;
use std::env;

// Módulos
mod models;
mod handlers {
    pub mod auth;
    pub mod booking;
    pub mod hotel;
}
mod middleware {
    pub mod auth;
}

// Imports
use models::*;
use handlers::{auth, booking};

// Ruta de salud
async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "message": "🚀 Maya Digital Backend funcionando correctamente",
        "version": "1.0.0"
    }))
}

// Datos mock para endpoints existentes (mantenemos compatibilidad)
async fn get_hoteles() -> HttpResponse {
    let hoteles = vec![
        serde_json::json!({
            "id": 1,
            "name": "Hotel Balam Kú",
            "location": "Tulum, Quintana Roo",
            "price": 2500,
            "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
        }),
        serde_json::json!({
            "id": 2,
            "name": "Hacienda Uxmal",
            "location": "Mérida, Yucatán",
            "price": 3200,
            "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925&auto=format&fit=crop"
        }),
        serde_json::json!({
            "id": 3,
            "name": "Resort Kin Ha",
            "location": "Palenque, Chiapas",
            "price": 1900,
            "image": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop"
        }),
    ];
    HttpResponse::Ok().json(hoteles)
}

async fn get_restaurantes() -> HttpResponse {
    let restaurantes = vec![
        serde_json::json!({
            "id": 1,
            "name": "Corazón de Jade",
            "specialty": "Cocina de Autor",
            "location": "Campeche",
            "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop"
        }),
        serde_json::json!({
            "id": 2,
            "name": "La Ceiba",
            "specialty": "Mariscos Frescos",
            "location": "Chetumal",
            "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
        }),
        serde_json::json!({
            "id": 3,
            "name": "El Fogón del Jaguar",
            "specialty": "Carnes y Tradición",
            "location": "Valladolid",
            "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
        })
    ];
    HttpResponse::Ok().json(restaurantes)
}

async fn get_experiencias() -> HttpResponse {
    let experiencias = vec![
        serde_json::json!({
            "id": 1,
            "type": "tour",
            "name": "Tour a Chichén Itzá",
            "price": 1200,
            "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=2070&auto=format&fit=crop"
        }),
        serde_json::json!({
            "id": 2,
            "type": "caballos",
            "name": "Paseo a Caballo",
            "price": 850,
            "image": "https://images.unsplash.com/photo-1599059813005-3603a5603703?q=80&w=1974&auto=format&fit=crop"
        }),
        serde_json::json!({
            "id": 3,
            "type": "cenote",
            "name": "Nado en Cenote Sagrado",
            "price": 450,
            "image": "https://images.unsplash.com/photo-1627907222543-4111d6946196?q=80&w=1965&auto=format&fit=crop"
        })
    ];
    HttpResponse::Ok().json(experiencias)
}

async fn get_productos() -> HttpResponse {
    let productos = vec![
        serde_json::json!({
            "id": 1,
            "name": "Huipil Ceremonial",
            "artisan": "Elena Poot",
            "price": 1800,
            "category": "textil",
            "img": "https://images.unsplash.com/photo-1620921207299-b37993505b12?q=80&w=1964&auto=format&fit=crop",
            "desc": "Tejido a mano con técnicas ancestrales, este huipil representa la cosmovisión maya en cada uno de sus hilos."
        }),
        serde_json::json!({
            "id": 2,
            "name": "Vasija de Sac-bé",
            "artisan": "Mateo Cruz",
            "price": 950,
            "category": "ceramica",
            "img": "https://images.unsplash.com/photo-1578899223131-a7isea110323?q=80&w=1887&auto=format&fit=crop",
            "desc": "Cerámica de alta temperatura pintada a mano con pigmentos naturales, ideal para decoración."
        })
    ];
    HttpResponse::Ok().json(productos)
}

async fn get_producto_by_id(path: web::Path<u32>) -> HttpResponse {
    let product_id = path.into_inner();
    let productos = vec![
        serde_json::json!({
            "id": 1,
            "name": "Huipil Ceremonial",
            "artisan": "Elena Poot",
            "price": 1800,
            "category": "textil",
            "img": "https://images.unsplash.com/photo-1620921207299-b37993505b12?q=80&w=1964&auto=format&fit=crop",
            "desc": "Tejido a mano con técnicas ancestrales, este huipil representa la cosmovisión maya en cada uno de sus hilos."
        }),
        serde_json::json!({
            "id": 2,
            "name": "Vasija de Sac-bé",
            "artisan": "Mateo Cruz",
            "price": 950,
            "category": "ceramica",
            "img": "https://images.unsplash.com/photo-1578899223131-a7isea110323?q=80&w=1887&auto=format&fit=crop",
            "desc": "Cerámica de alta temperatura pintada a mano con pigmentos naturales, ideal para decoración."
        }),
        serde_json::json!({
            "id": 3,
            "name": "Aretes de Filigrana",
            "artisan": "Isabel Chi",
            "price": 1200,
            "category": "joyeria",
            "img": "https://images.unsplash.com/photo-1611652032935-a6ce59b4c03d?q=80&w=1887&auto=format&fit=crop",
            "desc": "Elegantes aretes de plata trabajados con la delicada técnica de filigrana."
        })
    ];

    if let Some(producto) = productos.into_iter().find(|p| p["id"] == product_id) {
        HttpResponse::Ok().json(producto)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "error": "Producto no encontrado"
        }))
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Cargar variables de entorno
    dotenv().ok();

    println!("🚀 Iniciando Maya Digital Backend...");

    // Configurar conexión a la base de datos
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL debe estar configurado en .env");

    println!("🔗 Conectando a la base de datos...");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("Error conectando a PostgreSQL");

    // Ejecutar migraciones
    println!("📦 Ejecutando migraciones...");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Error ejecutando migraciones");

    println!("✅ Base de datos configurada exitosamente");

    let server_port = env::var("SERVER_PORT").unwrap_or_else(|_| "8080".to_string());
    let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());

    println!("🌟 Servidor iniciado en http://{}:{}", server_host, server_port);
    println!("📋 Endpoints disponibles:");
    println!("   - GET  /health");
    println!("   - POST /api/auth/register");
    println!("   - POST /api/auth/login");
    println!("   - GET  /api/auth/me (protegido)");
    println!("   - POST /api/bookings (protegido)");
    println!("   - GET  /api/bookings (protegido)");
    println!("   - GET  /api/hoteles");
    println!("   - GET  /api/restaurantes");
    println!("   - GET  /api/experiencias");
    println!("   - GET  /api/productos");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "PATCH"])
            .allowed_headers(vec!["Content-Type", "Authorization"])
            .supports_credentials()
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .wrap(actix_web::middleware::Logger::default())
            // Rutas públicas
            .route("/health", web::get().to(health))
            .route("/api/hoteles", web::get().to(get_hoteles))
            .route("/api/restaurantes", web::get().to(get_restaurantes))
            .route("/api/experiencias", web::get().to(get_experiencias))
            .route("/api/productos", web::get().to(get_productos))
            .route("/api/productos/{id}", web::get().to(get_producto_by_id))
            // Rutas de autenticación
            .route("/api/auth/register", web::post().to(auth::register))
            .route("/api/auth/login", web::post().to(auth::login))
            .route("/api/auth/me", web::get().to(auth::me))
            // Rutas protegidas de reservas
            .route("/api/bookings", web::post().to(booking::create_booking))
            .route("/api/bookings", web::get().to(booking::get_my_bookings))
            .route("/api/bookings/{id}/cancel", web::patch().to(booking::cancel_booking))
    })
    .bind(format!("{}:{}", server_host, server_port))?
    .run()
    .await
}