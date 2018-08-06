extends VBoxContainer

export var tile_size = Vector2(50, 50)
export var rows = 4
export var cols = 4

var tile_class = preload("res://BoardTile.gd")
var pawn_class = preload("res://Pawn.gd")

var tile_clicked_index = null

func _ready():
	var tile_color = tile_class.BLACK_TILE
	# remove space between rows
	self.add_constant_override("separation", 0)
	
	for i in range(rows):
		var row = HBoxContainer.new()
		# remove space between cols
		row.add_constant_override("separation", 0)
		
		for j in range(cols):
			row.add_child(create_tile(tile_color, Vector2(i, j)))
			tile_color = (tile_color+1)%2
		
		tile_color = (tile_color+cols+1)%2
		self.add_child(row)
	
	init_pawns()


func create_tile(tile_color, indices):
	var tile = tile_class.new(tile_color, tile_size, indices)
	tile.connect("play_from_tile_clicked", self, "_handle_play_from_click")
	tile.connect("play_to_tile_clicked", self, "_handle_play_to_click")
	return tile

func init_pawns():
	var pawn = pawn_class.new(tile_size)
	var tile = get_child(1).get_child(0)
	tile.set_pawn(pawn)

func _handle_play_from_click(index):
	var tiles
	var pawn = get_child(index.x).get_child(index.y).pawn
	
	if self.tile_clicked_index != index:
		# player choosed another tile, so we have to clean previous selection
		print("handling from")
		if self.tile_clicked_index != null:
			# not a first click for the turn
			tiles = get_available_tiles(self.tile_clicked_index)
			_unmark_tiles(tiles)

		self.tile_clicked_index = index
		tiles = get_available_tiles(index)
		_mark_tiles(tiles)

func _mark_tiles(tiles):
	for tile in tiles.values():
		tile.mark_tile()

func _unmark_tiles(tiles):
	for tile in tiles.values():
		tile.unmark_tile()

func get_available_tiles(index):
	var tiles = {}
	var pawn = get_child(index.x).get_child(index.y).pawn
	
	for d in pawn.directions:
		for i in range(1, pawn.steps+1):
			var z = index + d * i
			if z.x < 0 or z.x >= rows or z.y < 0 or z.y >= cols:
				# out of bound of the board
				break
			tiles[z] = get_child(z.x).get_child(z.y)
	
	return tiles

func _handle_play_to_click(index):
	
	_unmark_tiles(get_available_tiles(self.tile_clicked_index))
	
	_move_pawn_from_to(self.tile_clicked_index, index)
	
	self.tile_clicked_index = null

func _move_pawn_from_to(from, to):
	var tile_from = get_child(from.x).get_child(from.y)
	var tile_to = get_child(to.x).get_child(to.y)
	var vector_path = to - from
	
	var pawn = tile_from.pawn
	tile_from.remove_pawn()
	tile_to.set_pawn(pawn)

