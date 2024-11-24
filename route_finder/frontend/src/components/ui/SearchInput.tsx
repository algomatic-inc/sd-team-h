import { Input } from "./input";
import SearchIcon from "./icons/SearchIcon";

type SearchInputProps = {
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function SearchInput({ placeholder, value, onChange }: SearchInputProps) {
  return (
    <div className="flex items-center rounded-lg border border-gray-300 h-12">
      <SearchIcon className="h-4 w-4 ml-2" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-80 border-0 focus:ring-0 focus:border-none focus:outline-none focus-visible:ring-0"
      />
    </div>
  );
}

export default SearchInput;
