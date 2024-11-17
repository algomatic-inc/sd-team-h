import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Label } from "@radix-ui/react-label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SearchIcon from "@/components/ui/SearchIcon";
import SearchInput from "@/components/ui/SearchInput";

function Top() {
  return (
    <div>
      <div className="flex justify-center">
        <h1>Welcome to Route Planner</h1>
      </div>
      <div className="flex justify-center pt-2">
        <p>Plan your walking route and explore your surroundings.</p>
      </div>

      {/* Input area */}
      <div className="flex justify-center pt-8">
        <SearchInput placeholder="Explain your walking preference" />
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col justify-center pt-4">
          <div className="flex-none w-lg">
            <Switch id="starting-point" />
            <Label htmlFor="starting-point" className="pl-2">
              Use current location as starting point
            </Label>
          </div>
          <div className="flex-none w-lg pt-2">
            <Switch id="destination" />
            <Label htmlFor="destination" className="pl-2">
              Set destination via map
            </Label>
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-4">
        <Button className="bg-blue-500 text-white rounded-lg px-4 py-2 ml-2">
          <Link to="/result" className="text-white">
            Search
          </Link>
        </Button>
      </div>
      {/* Example queries */}

      <div className="flex justify-center pt-16">
        <div className="text-3xl">Example queries:</div>
      </div>
      <div className="flex justify-center pt-8">
        <Carousel opts={{ align: "start" }} className="w-full max-w-lg">
          <CarouselContent>
            <CarouselItem className="lg:basis-1/2">
              <ExampleQueryItem query="Mostly shaded route to the nearest park" />
            </CarouselItem>
            <CarouselItem className="lg:basis-1/2">
              <ExampleQueryItem query="Mostly shaded route to the nearest park" />
            </CarouselItem>
            <CarouselItem className="lg:basis-1/2">
              <ExampleQueryItem query="Mostly shaded route to the nearest park" />
            </CarouselItem>
            <CarouselItem className="lg:basis-1/2">
              <ExampleQueryItem query="Mostly shaded route to the nearest park" />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Example results */}
    </div>
  );
}

type QueryItemProps = {
  query: string;
};

function ExampleQueryItem({ query }: QueryItemProps) {
  return (
    <div className="flex items-center border p-2 rounded w-60 ">
      <SearchIcon className="h-4 w-4" />
      <div className="text-base pl-2 text-slate-600">{query}</div>
    </div>
  );
}

export default Top;
