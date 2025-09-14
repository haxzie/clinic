import React, { useState } from "react";
import styles from "./SearchBar.module.scss";
import SearchIcon from "@/components/icons/SearchIcon";

export default function SearchBar() {
  const [focsed, setFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className={[styles.searchBar, focsed && styles.focused].join(" ")}>
      <SearchIcon size={18} />
      <input
        value={searchValue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => setSearchValue(e.target.value)}
        type="text"
        placeholder="Search endpoints..."
        className={styles.searchInput}
      />
    </div>
  );
}
