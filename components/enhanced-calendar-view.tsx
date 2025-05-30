"use client"

import React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns"

interface EnhancedCalendarProps {
  selectedDate: Date | undefined
  onSelectDate: (date: Date) => void
  classScheduleDates: Date[]
}

export function EnhancedCalendarView({ selectedDate, onSelectDate, classScheduleDates }: EnhancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day names
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Function to check if a date has classes
  const hasClasses = (date: Date) => {
    return classScheduleDates.some((classDate) => isSameDay(classDate, date))
  }

  // Get the number of classes for a date
  const getClassCount = (date: Date) => {
    return classScheduleDates.filter((classDate) => isSameDay(classDate, date)).length
  }

  // Calculate the days to display in the calendar grid
  const firstDayOfMonth = monthStart.getDay() // 0 for Sunday, 1 for Monday, etc.

  // Get days from previous month to fill the first row
  const daysFromPreviousMonth = firstDayOfMonth
  const previousMonthDays = eachDayOfInterval({
    start: subMonths(monthStart, 1),
    end: subMonths(monthStart, 1),
  }).slice(-daysFromPreviousMonth)

  // Get days from next month to fill the last row
  const totalDaysToShow = 42 // 6 rows of 7 days
  const daysFromNextMonth = totalDaysToShow - daysInMonth.length - daysFromPreviousMonth
  const nextMonthDays = eachDayOfInterval({
    start: addMonths(monthStart, 1),
    end: addMonths(monthStart, 1),
  }).slice(0, daysFromNextMonth)

  // Combine all days
  const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays]

  // Split days into weeks
  const weeks = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="grid grid-cols-7 text-center">
          {dayNames.map((day, i) => (
            <div key={i} className="py-2 text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const hasClassesToday = hasClasses(day)
                const classCount = getClassCount(day)

                return (
                  <div
                    key={dayIndex}
                    className={`
                      relative h-10 p-1 text-center
                      ${!isCurrentMonth ? "text-muted-foreground/50" : ""}
                      ${isSelected ? "bg-primary text-primary-foreground" : ""}
                    `}
                    onClick={() => onSelectDate(day)}
                  >
                    <div
                      className={`
                      flex items-center justify-center h-8 w-8 mx-auto rounded-full
                      ${isSelected ? "" : "hover:bg-muted cursor-pointer"}
                    `}
                    >
                      {format(day, "d")}
                    </div>

                    {hasClassesToday && (
                      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(classCount, 3) }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 w-1 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`}
                            />
                          ))}
                          {classCount > 3 && (
                            <div className={`text-[0.5rem] ${isSelected ? "text-primary-foreground" : "text-primary"}`}>
                              +{classCount - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
        <span>Classes scheduled</span>
      </div>
    </div>
  )
}
