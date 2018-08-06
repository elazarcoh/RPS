extends Control

signal play_from_tile_clicked(index)
signal play_to_tile_clicked(index)

const BLACK_TILE = 0
const WHITE_TILE = 1
const UNMARKED = 0
const MARKED = 1

const texture_tile = preload("res://tile_sprite.png")
var tile_size
var index_on_board
var pawn = null
var sprite = null
var marked = false

enum {
	BLACK_TILE = 0
	WHITE_TILE = 1
}
var texture_color_index = BLACK_TILE

func _init(color_index, tile_size, board_index):
	# save tile properties
	self.index_on_board = board_index
	self.texture_color_index = color_index
	self.tile_size = tile_size
	
	# initilaize sprite
	self.sprite = Sprite.new()
	self.sprite.name = "TileSprite"
	self.add_child(sprite)

func _ready():
	# initilize tile properties
	self.rect_size = tile_size
	self.rect_min_size = tile_size
	
	# set sprite settings
	self.sprite.texture = texture_tile
	self.sprite.centered = false
	self.sprite.region_enabled = true
	var s = Vector2()
	s.x = self.rect_size.x/64
	s.y = self.rect_size.y/64
	self.sprite.scale = s
	set_tile_color(texture_color_index)

func set_tile_color(n):
	match n:
		BLACK_TILE:
			self.sprite.region_rect = _get_sprite_region(UNMARKED, BLACK_TILE)
			texture_color_index = BLACK_TILE
		WHITE_TILE:
			self.sprite.region_rect = _get_sprite_region(UNMARKED, WHITE_TILE)
			texture_color_index = WHITE_TILE

func _get_sprite_region(row, col):
	return Rect2(col * 64, row * 64, 64, 64)

func set_pawn(p):
	self.pawn = p
	self.add_child(self.pawn)

func remove_pawn():
	self.remove_child(self.pawn)
	self.pawn = null


func _gui_input(ev):
	if ev is InputEventMouseButton \
	and ev.button_index == BUTTON_LEFT \
	and ev.pressed:
		print(str(index_on_board) + " clicked")
		_handle_tile_click()

func _handle_tile_click():
	if !marked:
		# player selected tile to play from
		 _handle_play_from()
	else:
		# player selected tile to move into
		_handle_play_to()

func _handle_play_from():
	# the player selected a tile to move its pawn from
	if self.pawn != null:
			emit_signal("play_from_tile_clicked", self.index_on_board)

func _handle_play_to():
	# the player selected a tile to move its pawn to
	if self.pawn == null:
			emit_signal("play_to_tile_clicked", self.index_on_board)

func mark_tile():
	self.sprite.region_rect = _get_sprite_region(MARKED, self.texture_color_index)
	self.marked = true

func unmark_tile():
	self.sprite.region_rect = _get_sprite_region(UNMARKED, self.texture_color_index)
	self.marked = false

