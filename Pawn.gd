extends AnimatedSprite

const WIDTH = 500
const HEIGHT = 500

var walk_frames = preload("res://anime_walk.tres")
var _tile_size

func _init(tile_size):
	self._tile_size = tile_size

func _ready():
	# animation settings
	self.frames = walk_frames
	self.animation = "walk"

	# graphic settings
	self.z_index = 1 # set on top of tiles
	self.centered = false
	var s = Vector2()
	s.x = self._tile_size.x / WIDTH
	s.y = self._tile_size.y / HEIGHT
	self.scale = s
	self.position.y = -HEIGHT * s.x * 0.5  # 0.5 fits well 

func move_to(pos):
	pass




