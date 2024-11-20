from request_response_data import SearchRequest, SearchResponse, Route, Location, Place


_DUMMY_DESCRIPTION = (
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore "
    + "et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut "
    + "aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse "
    + "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in "
    + "culpa qui officia deserunt mollit anim id est laborum."
)


def build_mock_response(request: SearchRequest) -> SearchResponse:
    return SearchResponse(
        request=request,
        paragraphs=[
            "This is a mock response paragraph. " * 3,
            "This is another mock response paragraph." * 3,
        ],
        routes=[
            Route(
                title="Route with greenery",
                description=_DUMMY_DESCRIPTION,
                paths=[
                    Location(35.681236, 139.767125),
                    Location(35.681236, 139.767125),
                    Location(35.681236, 139.767125),
                ],
                places=[
                    Place(
                        name="Starting point",
                        description=_DUMMY_DESCRIPTION[:100],
                        location=Location(35.681236, 139.767125),
                    ),
                    Place(
                        name="Park 1",
                        description=_DUMMY_DESCRIPTION[:100],
                        location=Location(35.681236, 139.767125),
                    ),
                    Place(
                        name="Park 2",
                        description=_DUMMY_DESCRIPTION[:100],
                        location=Location(35.681236, 139.767125),
                    ),
                    Place(
                        name="Ending point",
                        description=_DUMMY_DESCRIPTION[:100],
                        location=Location(35.681236, 139.767125),
                    ),
                ],
                distance_in_meter=1000.0,
                walking_duration_in_minutes=10.0,
            ),
            Route(
                title="Route with greenery 2",
                description=_DUMMY_DESCRIPTION,
                paths=[
                    Location(35.681236, 139.767125),
                    Location(35.681236, 139.767125),
                    Location(35.681236, 139.767125),
                ],
                places=[
                    Place(
                        name="Starting point",
                        description=_DUMMY_DESCRIPTION[:100],
                        location=Location(35.681236, 139.767125),
                    ),
                    Place(
                        name="Park 1",
                        description=_DUMMY_DESCRIPTION[:100],
                        location=Location(35.681236, 139.767125),
                    ),
                    Place(
                        name="Park 2",
                        description=_DUMMY_DESCRIPTION[:100],
                        location=Location(35.681236, 139.767125),
                    ),
                    Place(
                        name="Ending point",
                        description=_DUMMY_DESCRIPTION[:100],
                        location=Location(35.681236, 139.767125),
                    ),
                ],
                distance_in_meter=1000.0,
                walking_duration_in_minutes=10.0,
            ),
        ],
    )
