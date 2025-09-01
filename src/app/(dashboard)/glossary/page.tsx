"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Info, Loader2, RefreshCw } from "lucide-react";
import { useGlossarySearch } from "@/hooks/useGlossarySearch";
import { DataInitService } from "@/services/dataInitService";
import type { GlossaryItem } from "@/types";

export default function GlossaryPage() {
  const [selectedTerm, setSelectedTerm] = useState<GlossaryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<{
    exerciseCount: number;
    glossaryCount: number;
    isInitialized: boolean;
  } | null>(null);

  const {
    results,
    isLoading,
    error,
    updateFilters,
    search,
  } = useGlossarySearch();

  // Use ref to avoid circular dependencies
  const searchRef = useRef(search);
  searchRef.current = search;

  const initializeData = useCallback(async () => {
    setIsInitializing(true);
    try {
      await DataInitService.ensureStorageInitialized();
      const result = await DataInitService.initializeAppData();

      if (!result.alreadyInitialized) {
        console.log(`Initialized ${result.exercisesAdded} exercises and ${result.glossaryAdded} glossary terms`);
      }

      // Refresh status and load terms
      const status = await DataInitService.getInitializationStatus();
      setInitStatus(status);

      // Use a timeout to avoid immediate re-render issues
      setTimeout(() => {
        searchRef.current({ query: "", categories: [], difficultyLevels: [] });
      }, 0);
    } catch (error) {
      console.error("Failed to initialize data:", error);
    } finally {
      setIsInitializing(false);
    }
  }, []); // Remove updateFilters dependency to prevent circular dependency

  // Check initialization status on mount
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const status = await DataInitService.getInitializationStatus();

        if (!isMounted) return;

        setInitStatus(status);

        if (!status.isInitialized) {
          await initializeData();
        } else {
          // Load some terms to display - only call if component is still mounted
          if (isMounted) {
            searchRef.current({ query: "", categories: [], difficultyLevels: [] });
          }
        }
      } catch (error) {
        console.error("Failed to check initialization status:", error);
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []); // No dependencies needed since we use ref

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    updateFilters({ query });
  }, [updateFilters]);

  const handleTermSelect = useCallback((term: GlossaryItem) => {
    setSelectedTerm(term);
  }, []);

  const handleRelatedTermClick = useCallback((termName: string) => {
    const relatedTerm = results.find(
      term => term.term.toLowerCase() === termName.toLowerCase()
    );
    if (relatedTerm) {
      setSelectedTerm(relatedTerm);
    } else {
      // Search for the term
      handleSearch(termName);
    }
  }, [results, handleSearch]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <h2 className="text-xl font-semibold">Setting up your fitness glossary...</h2>
        <p className="text-muted-foreground text-center">
          We&apos;re loading exercise definitions and safety tips for you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1>Fitness Glossary</h1>
            <p className="text-muted-foreground">
              Learn about exercises and fitness terminology
            </p>
          </div>
          {initStatus && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {initStatus.glossaryCount} terms available
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={initializeData}
                disabled={isInitializing}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="glossary-search">Search Terms</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            id="glossary-search"
            placeholder="Search for fitness terms..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Searching...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!isLoading && !error && results.length > 0 && (
        <div className="space-y-4">
          <h2>
            {searchQuery ? `Search Results (${results.length})` : `All Terms (${results.length})`}
          </h2>

          <div className="grid gap-4">
            {results.map((term) => (
              <Card 
                key={term.id} 
                className="cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => handleTermSelect(term)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{term.term}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {term.category}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          term.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                          term.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {term.difficulty_level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">
                    {term.plain_definition}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {term.related_terms.slice(0, 3).map((relatedTerm, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRelatedTermClick(relatedTerm);
                          }}
                        >
                          {relatedTerm}
                        </Badge>
                      ))}
                    </div>
                    <Info className="text-muted-foreground h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected Term Detail */}
      {selectedTerm && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{selectedTerm.term}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTerm(null)}
              >
                ✕
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{selectedTerm.category}</Badge>
              <Badge variant="secondary">{selectedTerm.difficulty_level}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">What it is:</h4>
              <p className="text-muted-foreground">{selectedTerm.plain_definition}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Why it matters:</h4>
              <p className="text-muted-foreground">{selectedTerm.why_it_matters}</p>
            </div>

            {selectedTerm.how_to_do_it_safely.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">How to do it safely:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedTerm.how_to_do_it_safely.map((tip, index) => (
                    <li key={index} className="text-muted-foreground text-sm">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTerm.related_terms.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Related Terms:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTerm.related_terms.map((relatedTerm, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleRelatedTermClick(relatedTerm)}
                    >
                      {relatedTerm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && results.length === 0 && searchQuery && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Search className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No terms found</h3>
            <p className="text-muted-foreground text-center text-sm mb-4">
              Try searching for different terms or browse all available terms.
            </p>
            <Button variant="outline" onClick={() => handleSearch("")}>
              Show All Terms
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Welcome State */}
      {!isLoading && !error && results.length === 0 && !searchQuery && initStatus?.glossaryCount === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <BookOpen className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Welcome to the Fitness Glossary</h3>
            <p className="text-muted-foreground text-center text-sm mb-4">
              Click the refresh button above to load fitness terms and definitions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}