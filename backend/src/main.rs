// backend/src/main.rs
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder, middleware};
use actix_cors::Cors;
use serde::{Serialize, Deserialize};
use std::sync::Mutex;

// ===== ESTRUCTURAS DE DATOS =====

#[derive(Serialize, Deserialize, Clone)] // ✅ Agregada Deserialize
struct Hotel {
    id: u32,
    name: String,
    location: String,
    price: u32,
    image: String,
}

#[derive(Serialize, Deserialize, Clone)] // ✅ Agregada Deserialize
struct Restaurant {
    id: u32,
    name: String,
    specialty: String,
    location: String,
    image: String,
}

#[derive(Serialize, Deserialize, Clone)] // ✅ Agregada Deserialize
struct Experience {
    id: u32,
    #[serde(rename = "type")]
    exp_type: String,
    name: String,
    price: u32,
    image: String,
}

#[derive(Serialize, Deserialize, Clone)] // ✅ Agregada Deserialize - ESTA ERA LA CLAVE
struct Product {
    id: u32,
    name: String,
    artisan: String,
    price: u32,
    category: String,
    img: String,
    desc: String,
}

// Estructuras para las reservas
#[derive(Serialize, Deserialize, Clone)]
struct HotelReservation {
    id: String,
    name: String,
    total: f64,
    date: String,
    status: String,
    checkin_date: Option<String>,
    checkout_date: Option<String>,
    addons: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Clone)]
struct ExperienceReservation {
    id: String,
    name: String,
    total: f64,
    date: String,
    status: String,
    personas: u32,
    details: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
struct RestaurantOrder {
    id: String,
    name: String,
    total: f64,
    date: String,
    status: String,
    items: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Clone)]
struct Purchase {
    id: String,
    items: Vec<Product>, // ✅ Ahora Product tiene Deserialize
    total: f64,
    date: String,
    status: String,
}

// Estructura para el historial completo del usuario
#[derive(Serialize, Deserialize, Clone)]
struct UserHistory {
    hotels: Vec<HotelReservation>,
    restaurants: Vec<RestaurantOrder>,
    experiences: Vec<ExperienceReservation>,
    purchases: Vec<Purchase>,
    total_spent: f64,
}

// Request bodies para las reservas
#[derive(Deserialize)]
struct CreateHotelReservation {
    name: String,
    total: f64,
    checkin_date: Option<String>,
    checkout_date: Option<String>,
    addons: Option<Vec<String>>,
}

#[derive(Deserialize)]
struct CreateExperienceReservation {
    name: String,
    total: f64,
    personas: u32,
    details: Option<String>,
}

#[derive(Deserialize)]
struct CreateRestaurantOrder {
    name: String,
    total: f64,
    items: Option<Vec<String>>,
}

// Estado global de la aplicación (en producción usarías PostgreSQL/MongoDB)
struct AppState {
    user_history: Mutex<UserHistory>,
}

// ===== ENDPOINTS ORIGINALES =====

#[get("/api/hoteles")]
async fn get_hoteles() -> impl Responder {
    let hoteles = vec![
        Hotel { 
            id: 1, 
            name: "Hotel Balam Kú".to_string(), 
            location: "Tulum, Quintana Roo".to_string(), 
            price: 2500, 
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop".to_string() 
        },
        Hotel { 
            id: 2, 
            name: "Hacienda Uxmal".to_string(), 
            location: "Mérida, Yucatán".to_string(), 
            price: 3200, 
            image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925&auto=format&fit=crop".to_string() 
        },
        Hotel { 
            id: 3, 
            name: "Resort Kin Ha".to_string(), 
            location: "Palenque, Chiapas".to_string(), 
            price: 1900, 
            image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop".to_string() 
        },
    ];
    HttpResponse::Ok().json(hoteles)
}

#[get("/api/restaurantes")]
async fn get_restaurantes() -> impl Responder {
    let restaurantes = vec![
        Restaurant { 
            id: 1, 
            name: "Corazón de Jade".to_string(), 
            specialty: "Cocina de Autor".to_string(), 
            location: "Campeche".to_string(), 
            image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop".to_string() 
        },
        Restaurant { 
            id: 2, 
            name: "La Ceiba".to_string(), 
            specialty: "Mariscos Frescos".to_string(), 
            location: "Chetumal".to_string(), 
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop".to_string() 
        },
        Restaurant { 
            id: 3, 
            name: "El Fogón del Jaguar".to_string(), 
            specialty: "Carnes y Tradición".to_string(), 
            location: "Valladolid".to_string(), 
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop".to_string() 
        }
    ];
    HttpResponse::Ok().json(restaurantes)
}

#[get("/api/experiencias")]
async fn get_experiencias() -> impl Responder {
    let experiencias = vec![
        Experience { 
            id: 1, 
            exp_type: "tour".to_string(), 
            name: "Tour a Chichén Itzá".to_string(), 
            price: 1200, 
            image: "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=2070&auto=format&fit=crop".to_string() 
        },
        Experience { 
            id: 2, 
            exp_type: "caballos".to_string(), 
            name: "Paseo a Caballo".to_string(), 
            price: 850, 
            image: "https://images.unsplash.com/photo-1599059813005-3603a5603703?q=80&w=1974&auto=format&fit=crop".to_string() 
        },
        Experience { 
            id: 3, 
            exp_type: "cenote".to_string(), 
            name: "Nado en Cenote Sagrado".to_string(), 
            price: 450, 
            image: "https://images.unsplash.com/photo-1627907222543-4111d6946196?q=80&w=1965&auto=format&fit=crop".to_string() 
        }
    ];
    HttpResponse::Ok().json(experiencias)
}

#[get("/api/productos")]
async fn get_productos() -> impl Responder {
    let productos = vec![
        Product { 
            id: 1, 
            name: "Huipil Ceremonial".to_string(), 
            artisan: "Elena Poot".to_string(), 
            price: 1800, 
            category: "textil".to_string(), 
            img: "https://images.unsplash.com/photo-1620921207299-b37993505b12?q=80&w=1964&auto=format&fit=crop".to_string(), 
            desc: "Tejido a mano con técnicas ancestrales, este huipil representa la cosmovisión maya en cada uno de sus hilos.".to_string() 
        },
        Product { 
            id: 2, 
            name: "Vasija de Sac-bé".to_string(), 
            artisan: "Mateo Cruz".to_string(), 
            price: 950, 
            category: "ceramica".to_string(), 
            img: "https://images.unsplash.com/photo-1578899223131-a7isea110323?q=80&w=1887&auto=format&fit=crop".to_string(), 
            desc: "Cerámica de alta temperatura pintada a mano con pigmentos naturales, ideal para decoración.".to_string() 
        },
    ];
    HttpResponse::Ok().json(productos)
}

#[get("/api/productos/{id}")]
async fn get_producto_by_id(path: web::Path<u32>) -> impl Responder {
    let product_id = path.into_inner();
    let productos = vec![
        Product { 
            id: 1, 
            name: "Huipil Ceremonial".to_string(), 
            artisan: "Elena Poot".to_string(), 
            price: 1800, 
            category: "textil".to_string(), 
            img: "https://images.unsplash.com/photo-1620921207299-b37993505b12?q=80&w=1964&auto=format&fit=crop".to_string(), 
            desc: "Tejido a mano con técnicas ancestrales, este huipil representa la cosmovisión maya en cada uno de sus hilos.".to_string() 
        },
        Product { 
            id: 2, 
            name: "Vasija de Sac-bé".to_string(), 
            artisan: "Mateo Cruz".to_string(), 
            price: 950, 
            category: "ceramica".to_string(), 
            img: "https://images.unsplash.com/photo-1578899223131-a7isea110323?q=80&w=1887&auto=format&fit=crop".to_string(), 
            desc: "Cerámica de alta temperatura pintada a mano con pigmentos naturales, ideal para decoración.".to_string() 
        },
        Product { 
            id: 3, 
            name: "Aretes de Filigrana".to_string(), 
            artisan: "Isabel Chi".to_string(), 
            price: 1200, 
            category: "joyeria".to_string(), 
            img: "https://images.unsplash.com/photo-1611652032935-a6ce59b4c03d?q=80&w=1887&auto=format&fit=crop".to_string(), 
            desc: "Elegantes aretes de plata trabajados con la delicada técnica de filigrana.".to_string() 
        }
    ];

    if let Some(producto) = productos.into_iter().find(|p| p.id == product_id) {
        HttpResponse::Ok().json(producto)
    } else {
        HttpResponse::NotFound().body("Producto no encontrado")
    }
}

// ===== NUEVOS ENDPOINTS PARA RESERVAS =====

#[post("/api/reservations/hotel")]
async fn create_hotel_reservation(
    data: web::Data<AppState>,
    reservation: web::Json<CreateHotelReservation>,
) -> impl Responder {
    let mut history = data.user_history.lock().unwrap();
    
    let new_reservation = HotelReservation {
        id: format!("H{}", chrono::Utc::now().timestamp_millis()),
        name: reservation.name.clone(),
        total: reservation.total,
        date: chrono::Utc::now().to_rfc3339(),
        status: "confirmed".to_string(),
        checkin_date: reservation.checkin_date.clone(),
        checkout_date: reservation.checkout_date.clone(),
        addons: reservation.addons.clone(),
    };
    
    history.hotels.push(new_reservation.clone());
    history.total_spent += reservation.total;
    
    HttpResponse::Ok().json(&new_reservation)
}

#[post("/api/reservations/experience")]
async fn create_experience_reservation(
    data: web::Data<AppState>,
    reservation: web::Json<CreateExperienceReservation>,
) -> impl Responder {
    let mut history = data.user_history.lock().unwrap();
    
    let new_reservation = ExperienceReservation {
        id: format!("E{}", chrono::Utc::now().timestamp_millis()),
        name: reservation.name.clone(),
        total: reservation.total,
        date: chrono::Utc::now().to_rfc3339(),
        status: "confirmed".to_string(),
        personas: reservation.personas,
        details: reservation.details.clone(),
    };
    
    history.experiences.push(new_reservation.clone());
    history.total_spent += reservation.total;
    
    HttpResponse::Ok().json(&new_reservation)
}

#[post("/api/reservations/restaurant")]
async fn create_restaurant_order(
    data: web::Data<AppState>,
    order: web::Json<CreateRestaurantOrder>,
) -> impl Responder {
    let mut history = data.user_history.lock().unwrap();
    
    let new_order = RestaurantOrder {
        id: format!("R{}", chrono::Utc::now().timestamp_millis()),
        name: order.name.clone(),
        total: order.total,
        date: chrono::Utc::now().to_rfc3339(),
        status: "confirmed".to_string(),
        items: order.items.clone(),
    };
    
    history.restaurants.push(new_order.clone());
    history.total_spent += order.total;
    
    HttpResponse::Ok().json(&new_order)
}

#[get("/api/user/history")]
async fn get_user_history(data: web::Data<AppState>) -> impl Responder {
    let history = data.user_history.lock().unwrap();
    HttpResponse::Ok().json(history.clone())
}

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "message": "🚀 Servidor de Maya Digital funcionando correctamente"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Servidor de Maya Digital iniciado en http://127.0.0.1:8080");

    // Estado inicial de la aplicación
    let app_state = web::Data::new(AppState {
        user_history: Mutex::new(UserHistory {
            hotels: Vec::new(),
            restaurants: Vec::new(),
            experiences: Vec::new(),
            purchases: Vec::new(),
            total_spent: 0.0,
        }),
    });

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec!["Content-Type", "Authorization"])
            .supports_credentials()
            .max_age(3600);

        App::new()
            .app_data(app_state.clone())
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .service(health)
            .service(get_hoteles)
            .service(get_restaurantes)
            .service(get_experiencias)
            .service(get_productos)
            .service(get_producto_by_id)
            // Nuevos endpoints para reservas
            .service(create_hotel_reservation)
            .service(create_experience_reservation)
            .service(create_restaurant_order)
            .service(get_user_history)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}