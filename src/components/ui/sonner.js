var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
const Toaster = (_a) => {
    var props = __rest(_a, []);
    const { theme = "system" } = useTheme();
    return (React.createElement(Sonner, Object.assign({ theme: theme, className: "toaster group", toastOptions: {
            classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
            },
        } }, props)));
};
export { Toaster };
