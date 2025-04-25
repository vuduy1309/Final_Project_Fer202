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
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
function Sheet(_a) {
    var props = __rest(_a, []);
    return React.createElement(SheetPrimitive.Root, Object.assign({ "data-slot": "sheet" }, props));
}
function SheetTrigger(_a) {
    var props = __rest(_a, []);
    return React.createElement(SheetPrimitive.Trigger, Object.assign({ "data-slot": "sheet-trigger" }, props));
}
function SheetClose(_a) {
    var props = __rest(_a, []);
    return React.createElement(SheetPrimitive.Close, Object.assign({ "data-slot": "sheet-close" }, props));
}
function SheetPortal(_a) {
    var props = __rest(_a, []);
    return React.createElement(SheetPrimitive.Portal, Object.assign({ "data-slot": "sheet-portal" }, props));
}
function SheetOverlay(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (React.createElement(SheetPrimitive.Overlay, Object.assign({ "data-slot": "sheet-overlay", className: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80", className) }, props)));
}
function SheetContent(_a) {
    var { className, children, side = "right" } = _a, props = __rest(_a, ["className", "children", "side"]);
    return (React.createElement(SheetPortal, null,
        React.createElement(SheetOverlay, null),
        React.createElement(SheetPrimitive.Content, Object.assign({ "data-slot": "sheet-content", className: cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500", side === "right" &&
                "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm", side === "left" &&
                "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm", side === "top" &&
                "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b", side === "bottom" &&
                "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t", className) }, props),
            children,
            React.createElement(SheetPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none" },
                React.createElement(XIcon, { className: "size-4" }),
                React.createElement("span", { className: "sr-only" }, "Close")))));
}
function SheetHeader(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (React.createElement("div", Object.assign({ "data-slot": "sheet-header", className: cn("flex flex-col gap-1.5 p-4", className) }, props)));
}
function SheetFooter(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (React.createElement("div", Object.assign({ "data-slot": "sheet-footer", className: cn("mt-auto flex flex-col gap-2 p-4", className) }, props)));
}
function SheetTitle(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (React.createElement(SheetPrimitive.Title, Object.assign({ "data-slot": "sheet-title", className: cn("text-foreground font-semibold", className) }, props)));
}
function SheetDescription(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (React.createElement(SheetPrimitive.Description, Object.assign({ "data-slot": "sheet-description", className: cn("text-muted-foreground text-sm", className) }, props)));
}
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, };
