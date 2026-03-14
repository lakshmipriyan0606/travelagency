import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
}

interface NiceSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    triggerClassName?: string;
}

export const NiceSelect = ({
    value,
    onValueChange,
    options,
    placeholder = "Select an option",
    className,
    triggerClassName,
}: NiceSelectProps) => {
    return (
        <div className={cn("relative w-full", className)}>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger
                    className={cn(
                        "w-full bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 px-4 py-3 text-sm font-medium text-gray-700 tracking-wider h-full outline-none flex items-center justify-between",
                        triggerClassName
                    )}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100 shadow-2xl rounded-xl">
                    {options.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="py-2.5 px-4 text-sm font-medium text-gray-700 focus:bg-primary/10 focus:text-primary data-[state=checked]:bg-primary/5 data-[state=checked]:text-primary rounded-lg transition-colors cursor-pointer"
                        >
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
