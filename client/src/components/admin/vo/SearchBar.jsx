import { debounce } from 'lodash';
import { useState, useCallback } from "react";
import { Search, RefreshCcw } from "lucide-react"; // import an icon for the button
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // assuming you're using a UI library with a Button component

export default function SearchBar({ searchTerm, setSearchTerm, setCurrentPage, refetch }) {
  const [inputValue, setInputValue] = useState("");

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    [setSearchTerm, setCurrentPage]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <div className="flex gap-2 w-full md:w-80">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-8"
          value={inputValue}
          onChange={handleSearchChange}
        />
      </div>
      <Button variant="outline" onClick={refetch}>
        <RefreshCcw className="h-4 w-4 mr-1" />
        Refresh
      </Button>
    </div>
  );
}
