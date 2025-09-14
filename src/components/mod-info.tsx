import { Button } from "./ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { cn } from "@/lib/utils"

export function CardDemo({className, title, description}: {className?: string, title?: string, description?: string}) {
  return (
    <Card className={cn("w-full w-[400px]  lg:max-w-sm flex flex-col items-center justify-center min-h-[400px]", className)}>
        
        <CardContent className="space-y-4">
            <CardDescription className="text-center text-2xl lg:text-6xl font-bold text-slate-700 dark:text-slate-300">
            {title}
            </CardDescription>
            <CardDescription className="text-center text-lg lg:text-2xl font-bold text-slate-700 dark:text-slate-300">
            {description}
            </CardDescription>
        </CardContent>

    </Card>

  )
}


export default function ModInfo() {
    return (
        <div className="flex items-center justify-center mt-16 lg:-mt-16 w-full lg:mx-32">
            <div className="grid grid-cols-1  lg:my-24 lg:space-y-[170px]">
            <CardDemo className="w-full lg:min-w-md min-h-[400px] bg-gray-200 dark:bg-black" title="Free" description="All services is for you"></CardDemo>
            <CardDemo className="w-full lg:min-w-md min-h-[400px] bg-gray-200 dark:bg-black" title="1000" description="More than 1K tokens"></CardDemo>
            </div>
        </div>
    );
}