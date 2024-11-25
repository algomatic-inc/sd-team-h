# generate_route Function Documentation

The generate_route function generates a route between two points considering various factors like length, green index, water index, shade index, slope index, road safety, isolation, and landmarks. It outputs the route as a GeoJSON file and also outputs a GeoJSON file containing landmarks within a buffer around the route.

Function Signature

CREATE OR REPLACE FUNCTION generate_route(
    weight_length DOUBLE PRECISION,
    weight_green_index DOUBLE PRECISION,
    weight_water_index DOUBLE PRECISION,
    weight_shade_index DOUBLE PRECISION,
    weight_slope_index DOUBLE PRECISION,
    weight_road_safety DOUBLE PRECISION,
    weight_isolation DOUBLE PRECISION,
    weight_landmarks DOUBLE PRECISION,
    landmark_types TEXT[],
    start_lat DOUBLE PRECISION,
    start_lon DOUBLE PRECISION,
    end_lat DOUBLE PRECISION,
    end_lon DOUBLE PRECISION,
    output_file TEXT,
    landmarks_output_file TEXT
) RETURNS VOID

Parameters

	•	weight_length (DOUBLE PRECISION): Weight assigned to the route length. Affects how much the length of the route influences the routing decision.
	•	weight_green_index (DOUBLE PRECISION): Weight assigned to the green index (e.g., NDVI). Affects how much the greenery along the route influences the routing decision.
	•	weight_water_index (DOUBLE PRECISION): Weight assigned to the water index (e.g., NDWI). Affects how much proximity to water influences the routing decision.
	•	weight_shade_index (DOUBLE PRECISION): Weight assigned to the shade index. Affects how much shaded areas influence the routing decision.
	•	weight_slope_index (DOUBLE PRECISION): Weight assigned to the slope index. Affects how much the slope or incline influences the routing decision.
	•	weight_road_safety (DOUBLE PRECISION): Weight assigned to the road safety index. Affects how much road safety influences the routing decision.
	•	weight_isolation (DOUBLE PRECISION): Weight assigned to the isolation index. Affects how much isolated or quiet areas influence the routing decision.
	•	weight_landmarks (DOUBLE PRECISION): Weight assigned to landmarks. Affects how much proximity to specified landmarks influences the routing decision.
	•	landmark_types (TEXT[]): An array of landmark types to consider in the routing decision. The types must be selected from the list of possible landmark types (provided below). If no landmarks are to be considered, an empty array ARRAY[]::text[] should be provided.
	•	start_lat (DOUBLE PRECISION): Latitude of the starting point.
	•	start_lon (DOUBLE PRECISION): Longitude of the starting point.
	•	end_lat (DOUBLE PRECISION): Latitude of the ending point.
	•	end_lon (DOUBLE PRECISION): Longitude of the ending point.
	•	output_file (TEXT): Path to the output GeoJSON file where the route will be saved.
	•	landmarks_output_file (TEXT): Path to the output GeoJSON file where the landmarks within the buffer around the route will be saved.

Notes

	•	Weights Range: Each weight should be between 0 and 1 inclusive.
	•	Weights Sum: The weights do not need to sum to 1. They are used to adjust the importance of each factor relative to others.
	•	Effect of Weights:
	•	A weight of 0 means that the corresponding factor is not included in the routing calculation.
	•	A weight closer to 1 increases the influence of that factor in the routing decision.
	•	Landmark Types: The landmark_types array should contain the types of landmarks you want to consider. The types must be selected from the list provided below.
	•	Empty Landmark Types: If you do not wish to consider landmarks, provide an empty array cast to text[], i.e., ARRAY[]::text[].
	•	Output Files: Ensure that the PostgreSQL server process has write permissions to the directories where the output files will be saved.

Possible Landmark Types

Below is the list of all possible landmark types that can be used in the landmark_types parameter:
	•	luggage_locker
	•	toys
	•	hardware
	•	crematorium
	•	trade
	•	vending_machine
	•	tailor
	•	museum
	•	photo
	•	social_facility
	•	yes
	•	childcare
	•	agrarian
	•	nutrition_supplements
	•	studio
	•	research_institute
	•	houseware
	•	prep_school
	•	parking
	•	greengrocer
	•	training
	•	outdoor
	•	magic_and_illusion_supplies
	•	kiosk
	•	shoes
	•	fast_food
	•	townhall
	•	school
	•	parking_space
	•	clock
	•	library
	•	food
	•	dojo
	•	travel_agency
	•	food_court
	•	hobby
	•	second_hand
	•	wholesale
	•	stationery
	•	smoking_area
	•	language_school
	•	charging_station
	•	apartment
	•	police
	•	biergarten
	•	archaeological_site
	•	beauty
	•	tobacco
	•	restaurant
	•	kindergarten
	•	shower
	•	bar
	•	parts
	•	coffee
	•	shelter
	•	wayside_shrine
	•	organic
	•	public_building
	•	car_rental
	•	viewpoint
	•	community_centre
	•	bicycle_rental
	•	hospital
	•	mall
	•	memorial
	•	waste_basket
	•	gas
	•	pub
	•	kitchen
	•	interior_decoration
	•	fuel
	•	atm
	•	college
	•	video
	•	parcel_locker
	•	car_parts
	•	bakery
	•	karaoke_box
	•	pet
	•	mobile_phone
	•	toilets
	•	music
	•	sports
	•	collector
	•	funeral_directors
	•	car_sharing
	•	medical_supply
	•	pet_grooming
	•	tea
	•	confectionery
	•	community_centre;theatre
	•	books
	•	nursing_home
	•	rice
	•	monument
	•	motorcycle
	•	watches
	•	copyshop
	•	artwork
	•	coworking_space
	•	religion
	•	bag
	•	massage
	•	bbq
	•	drinking_water
	•	pottery
	•	variety_store
	•	jewelry
	•	laundry
	•	hairdresser
	•	newsagent
	•	supermarket
	•	veterinary
	•	clinic
	•	butcher
	•	radiotechnics
	•	love_hotel
	•	marketplace
	•	car_repair
	•	bicycle_parking
	•	chemist
	•	hostel
	•	pawnbroker
	•	bus_station
	•	parking_entrance
	•	guest_house
	•	dentist
	•	taxi
	•	storage_rental
	•	loading_dock
	•	cinema
	•	recycling
	•	internet_cafe
	•	courthouse
	•	curtain
	•	general
	•	bed
	•	public_bath
	•	deli
	•	nightclub
	•	pharmacy
	•	telephone
	•	brothel
	•	fountain
	•	theatre
	•	social_facility;community_centre
	•	hairdresser_supply
	•	furniture
	•	information
	•	cosmetics
	•	gallery
	•	doityourself
	•	car
	•	motorcycle_parking
	•	milestone
	•	pastry
	•	hotel
	•	photo_booth
	•	cafe
	•	seafood
	•	florist
	•	electronics
	•	shoe_repair
	•	antiques
	•	ice_cream
	•	doctors
	•	dairy
	•	appliance
	•	post_box
	•	electrical
	•	bench
	•	convenience
	•	clothes
	•	boutique
	•	money_lender
	•	alcohol
	•	place_of_worship
	•	optician
	•	bank
	•	lottery
	•	dry_cleaning
	•	post_office
	•	bicycle
	•	baby_goods
	•	fire_station
	•	attraction

Examples

Example 1: Using Landmarks

SELECT generate_route(
  0.2,                    -- weight for length
  0.3,                    -- weight for green index
  0.1,                    -- weight for water index
  0.1,                    -- weight for shade index
  0.1,                    -- weight for slope index
  0.1,                    -- weight for road safety
  0.05,                   -- weight for isolation
  0.15,                   -- weight for landmarks
  ARRAY['pub', 'bar'],    -- landmark types
  35.781660,              -- start latitude
  139.726770,             -- start longitude
  35.811339,              -- end latitude
  139.653754,             -- end longitude
  '/path/to/route_output.geojson',          -- route output file
  '/path/to/landmarks_output.geojson'       -- landmarks output file
);

Example 2: Without Landmarks

SELECT generate_route(
  0.5,                    -- weight for length
  0.25,                   -- weight for green index
  0.25,                   -- weight for water index
  0,                      -- weight for shade index
  0,                      -- weight for slope index
  0,                      -- weight for road safety
  0,                      -- weight for isolation
  0,                      -- weight for landmarks
  ARRAY[]::text[],        -- empty landmark types array
  35.781660,              -- start latitude
  139.726770,             -- start longitude
  35.811339,              -- end latitude
  139.653754,             -- end longitude
  '/path/to/route_output.geojson',          -- route output file
  '/path/to/landmarks_output.geojson'       -- landmarks output file (will be empty)
);

In this example, landmarks are not considered in the routing decision.

Additional Notes

	•	Adjusting Weights: You can adjust the weights to prioritize certain factors over others. For example, if you want a route that heavily favors green areas, increase weight_green_index.
	•	Buffer Distance: The function uses a buffer distance of 100 meters around the route to select landmarks. This distance can be adjusted within the function if needed.
	•	Data Requirements: The function assumes that your database contains the necessary tables and data, such as ways, ways_vertices_pgr, and landmarks, with appropriate spatial columns and indexes.
	•	Permissions: Ensure that the PostgreSQL server has write permissions to the directories specified in output_file and landmarks_output_file.
	•	Error Handling: The function does not include extensive error handling. Ensure that the inputs are valid and that the data required for routing is present in the database.

Please make sure to replace /path/to/route_output.geojson and /path/to/landmarks_output.geojson with the actual paths where you want the output files to be saved, and that these paths are accessible and writable by the PostgreSQL server.
