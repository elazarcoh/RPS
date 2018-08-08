extends AnimatedSprite

const WIDTH = 500
const HEIGHT = 500
export var directions = [Vector2(0,1),
						Vector2(0,-1),
						Vector2(1,0),
						Vector2(-1,0)]

var walk_frames = preload("res://anime_walk.tres")
var _tile_size

export var speed = 70
export var steps = 1
export var player_num = 0

func _init(tile_size, player_num):
	self._tile_size = tile_size
	self.player_num = player_num

func _ready():
	# animation settings
	self.frames = walk_frames
	self.animation = "walk"
	
	var tween =  Tween.new()
	tween.name = "Tween"
	self.add_child(tween)

func set_on_tile():
	self.playing = false
	
	# graphic settings
	self.z_index = 1 # set on top of tiles
	self.position = Vector2()
	self.centered = false
	var s = Vector2()
	s.x = self._tile_size.x / WIDTH
	s.y = self._tile_size.y / HEIGHT
	self.scale = s
	self.position.y = -HEIGHT * s.x * 0.5  # 0.5 fits well 

func _get_move_tween(vec):
	var tween = get_node("Tween")
	
	var time = (vec * _tile_size).length() / self.speed
	
	tween.interpolate_property(self, "position",
								self.position,
								self.position + vec * _tile_size,
								time,
								Tween.TRANS_SINE,
								Tween.EASE_IN_OUT)
	return tween

func animate():
	play()

func stop_animation():
	stop()
	self.frame = 0


