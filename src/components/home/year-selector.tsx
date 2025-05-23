
// @/components/home/year-selector.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { YEAR_LEVELS, type YearLevel } from "@/lib/constants";
import { ChevronRight, Target } from "lucide-react";

interface YearSelectorProps {
  onYearSelect: (year: YearLevel) => void;
  selectedYear?: YearLevel | null;
}

export function YearSelector({ onYearSelect, selectedYear }: YearSelectorProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl mb-12">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Target className="mr-3 h-7 w-7 text-primary" />
          Select Your Year Level
        </CardTitle>
        <CardDescription>Choose your current year level to get started.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {YEAR_LEVELS.map((year) => (
          <Button
            key={year}
            variant={selectedYear === year ? "default" : "outline"}
            size="lg"
            className="text-lg py-8 flex justify-between items-center"
            onClick={() => onYearSelect(year)}
          >
            {year}
            {selectedYear === year && <ChevronRight className="h-5 w-5" />}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
