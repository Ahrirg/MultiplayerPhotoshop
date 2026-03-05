use super::util::Vector2d;

// Object
pub struct Object {
    pub id: String,
    pub user_name: String,

    pub size: Vector2d,
    pub position: Vector2d,
}

// Image
pub struct Image {
    object: Object,
    image_uuid: String,
} 

// Text
pub struct Text {
    object: Object,
    content: String,
    font: String,
    font_size: i32,
}