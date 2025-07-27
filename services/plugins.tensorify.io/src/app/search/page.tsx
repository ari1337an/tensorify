import { Suspense } from "react";
import SearchPageContent from "./search-client";

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
