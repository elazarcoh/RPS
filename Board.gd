extends VBoxContainer

export var tile_size = Vector2(100, 100)
var rows = 4
var cols = 4

var tile_class = preload("res://BoardTile.gd")
var pawn_class = preload("res://Pawn.gd")

func _ready():
	var tile_color = tile_class.BLACK_TILE
	# remove space between rows
	self.add_constant_override("separation", 0)
	
	for i in range(rows):
		var row = HBoxContainer.new()
		# remove space between cols
		row.add_constant_override("separation", 0)
		
		for j in range(cols):
			row.add_child(create_tile(tile_color))
			tile_color = (tile_color+1)%2
		
		tile_color = (tile_color+1)%2
		self.add_child(row)
	
	init_pawns()

func create_tile(tile_color):
	var tile = tile_class.new(tile_color, tile_size)
	return tile

func init_pawns():
	var pawn = pawn_class.new(tile_size)
	var tile = get_child(0).get_child(0)
	tile.set_pawn(pawn)