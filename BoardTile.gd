extends Control

const texture_tile = preload("res://tile_sprite.png")
var tile_size
var pawn_on_tile = false

enum {
	BLACK_TILE = 0
	WHITE_TILE = 1
}
var texture_index = BLACK_TILE

func _init(color_index, tile_size):
	var sprite = Sprite.new()
	sprite.name = "TileSprite"
	texture_index = color_index
	self.tile_size = tile_size
	self.add_child(sprite)

func _ready():
	self.rect_size = tile_size
	self.rect_min_size = tile_size
	var sprite = get_node("TileSprite")
	sprite.texture = texture_tile
	sprite.centered = false
	sprite.region_enabled = true
	var s = Vector2()
	s.x = self.rect_size.x/64
	s.y = self.rect_size.y/64
	sprite.scale = s
	set_texture(texture_index)

func set_texture(n):
	match n:
		BLACK_TILE:
			get_node("TileSprite").region_rect = Rect2(0,0,64,64)
			texture_index = BLACK_TILE
		WHITE_TILE:
			get_node("TileSprite").region_rect = Rect2(64,0,64,64)
			texture_index = WHITE_TILE

func set_pawn(p):
	self.add_child(p)
	self.pawn_on_tile = true

func _gui_input(ev):
	if self.pawn_on_tile \
	and ev is InputEventMouseButton \
	and ev.button_index == BUTTON_LEFT \
	and ev.pressed:
		set_texture((texture_index+1)%2)

