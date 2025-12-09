import React from "react";
import { cn } from "@/lib/utils";

interface BedroomSceneProps {
  className?: string;
}

export const BedroomScene: React.FC<BedroomSceneProps> = ({ className }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Ambient moonlight from window */}
      <div className="absolute top-8 right-12 w-32 h-48 rounded-lg bg-gradient-to-b from-blue-200/10 to-transparent blur-sm" />
      <div className="absolute top-8 right-12 w-32 h-48 border-2 border-white/10 rounded-lg" />
      {/* Window glow rays */}
      <div className="absolute top-12 right-16 w-64 h-80 bg-gradient-to-bl from-blue-300/5 via-transparent to-transparent blur-2xl" />
      
      {/* Floor gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#1a1520]/80 to-transparent" />
      
      {/* Wooden floor planks */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden opacity-30">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 h-full border-r border-amber-900/20"
            style={{ left: `${i * 8.33}%`, width: "8.33%" }}
          >
            <div className="h-full bg-gradient-to-r from-amber-950/40 to-amber-900/20" />
          </div>
        ))}
      </div>

      {/* Large Bed - center left */}
      <div className="absolute bottom-16 left-[8%] w-[35%] h-28">
        {/* Bed frame */}
        <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-amber-950/60 to-amber-900/40 rounded-sm" />
        {/* Mattress */}
        <div className="absolute bottom-6 w-full h-10 bg-gradient-to-t from-slate-700/50 to-slate-600/30 rounded-t-lg" />
        {/* Blanket/duvet */}
        <div className="absolute bottom-10 w-[95%] left-[2.5%] h-14 bg-gradient-to-t from-indigo-900/40 via-indigo-800/30 to-indigo-700/20 rounded-t-xl" />
        {/* Pillows */}
        <div className="absolute bottom-20 left-[5%] w-[25%] h-8 bg-gradient-to-t from-slate-400/30 to-slate-300/20 rounded-lg" />
        <div className="absolute bottom-20 left-[35%] w-[25%] h-8 bg-gradient-to-t from-slate-400/30 to-slate-300/20 rounded-lg" />
        {/* Headboard */}
        <div className="absolute bottom-24 w-full h-20 bg-gradient-to-t from-amber-950/50 to-amber-900/30 rounded-t-xl" />
      </div>

      {/* Nightstand - left of bed */}
      <div className="absolute bottom-14 left-[2%] w-12 h-16">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-amber-950/60 to-amber-900/40 rounded-sm" />
        {/* Lamp on nightstand */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-200/40 rounded-full blur-sm" />
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-t from-amber-100/20 to-amber-50/10 rounded-full" />
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-4 bg-amber-900/50 rounded-sm" />
      </div>

      {/* Cozy Rug - center floor */}
      <div className="absolute bottom-6 left-[15%] w-[30%] h-10 bg-gradient-to-t from-rose-950/30 via-rose-900/20 to-rose-800/10 rounded-[100%] blur-[1px]" />
      <div className="absolute bottom-7 left-[16%] w-[28%] h-8 border border-rose-700/20 rounded-[100%]" />

      {/* Coffee Table - center */}
      <div className="absolute bottom-10 left-[48%] w-20 h-6">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-amber-950/50 to-amber-800/30 rounded-sm" />
        {/* Table legs */}
        <div className="absolute -bottom-4 left-1 w-2 h-4 bg-amber-950/40" />
        <div className="absolute -bottom-4 right-1 w-2 h-4 bg-amber-950/40" />
        {/* Items on table */}
        <div className="absolute -top-2 left-2 w-4 h-3 bg-slate-600/30 rounded-sm" /> {/* Book */}
        <div className="absolute -top-3 right-3 w-3 h-4 bg-slate-500/20 rounded-full" /> {/* Mug */}
      </div>

      {/* Armchair/Couch - right of coffee table */}
      <div className="absolute bottom-8 left-[62%] w-24 h-20">
        {/* Seat */}
        <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-slate-800/50 to-slate-700/30 rounded-lg" />
        {/* Back */}
        <div className="absolute bottom-8 w-full h-14 bg-gradient-to-t from-slate-700/40 to-slate-600/20 rounded-t-xl" />
        {/* Armrests */}
        <div className="absolute bottom-4 -left-2 w-4 h-10 bg-slate-700/30 rounded-l-lg" />
        <div className="absolute bottom-4 -right-2 w-4 h-10 bg-slate-700/30 rounded-r-lg" />
        {/* Cushion */}
        <div className="absolute bottom-6 left-2 right-2 h-6 bg-gradient-to-t from-indigo-800/30 to-indigo-700/20 rounded-lg" />
      </div>

      {/* Bookshelf - right wall */}
      <div className="absolute bottom-14 right-[6%] w-16 h-40">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-l from-amber-950/60 to-amber-900/40 rounded-sm" />
        {/* Shelves */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="absolute w-full h-[1px] bg-amber-800/40" style={{ bottom: `${(i + 1) * 25}%` }} />
        ))}
        {/* Books */}
        <div className="absolute bottom-[10%] left-1 w-3 h-6 bg-rose-900/40 rounded-sm" />
        <div className="absolute bottom-[10%] left-5 w-2 h-5 bg-blue-900/40 rounded-sm" />
        <div className="absolute bottom-[10%] left-8 w-3 h-7 bg-emerald-900/40 rounded-sm" />
        <div className="absolute bottom-[35%] left-2 w-4 h-5 bg-amber-800/40 rounded-sm" />
        <div className="absolute bottom-[35%] left-7 w-3 h-6 bg-purple-900/40 rounded-sm" />
        <div className="absolute bottom-[60%] left-1 w-3 h-5 bg-cyan-900/40 rounded-sm" />
        <div className="absolute bottom-[60%] left-5 w-4 h-6 bg-rose-800/40 rounded-sm" />
      </div>

      {/* Standing Lamp - right side */}
      <div className="absolute bottom-14 right-[24%]">
        {/* Lamp pole */}
        <div className="w-1 h-32 bg-gradient-to-t from-amber-900/50 to-amber-800/30 mx-auto" />
        {/* Lamp shade */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-8 bg-gradient-to-t from-amber-100/20 to-amber-50/10 rounded-t-full rounded-b-lg" />
        {/* Lamp glow */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-200/10 rounded-full blur-xl" />
      </div>

      {/* Fireplace - bottom center */}
      <div className="absolute bottom-0 left-[42%] w-28 h-24">
        {/* Fireplace frame */}
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-stone-900/60 to-stone-800/40 rounded-t-xl" />
        {/* Fireplace opening */}
        <div className="absolute bottom-2 left-3 right-3 h-14 bg-gradient-to-t from-stone-950/80 to-stone-900/60 rounded-t-lg" />
        {/* Fire glow */}
        <div className="absolute bottom-4 left-6 right-6 h-8 bg-gradient-to-t from-orange-600/40 via-orange-500/20 to-transparent rounded-full blur-sm animate-pulse" />
        <div className="absolute bottom-2 left-8 right-8 h-4 bg-gradient-to-t from-orange-500/50 to-orange-400/30 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
        {/* Mantle */}
        <div className="absolute top-0 -left-2 -right-2 h-3 bg-gradient-to-b from-stone-700/50 to-stone-800/40 rounded-t-sm" />
        {/* Decorations on mantle */}
        <div className="absolute -top-4 left-2 w-4 h-5 bg-slate-600/30 rounded-sm" /> {/* Frame */}
        <div className="absolute -top-3 right-4 w-3 h-4 bg-slate-500/20 rounded-full" /> {/* Vase */}
      </div>

      {/* Potted Plant - corner */}
      <div className="absolute bottom-14 right-[2%]">
        {/* Pot */}
        <div className="w-8 h-6 bg-gradient-to-t from-orange-950/50 to-orange-900/30 rounded-b-lg rounded-t-sm mx-auto" />
        {/* Plant leaves */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-emerald-900/40" />
          <div className="absolute top-0 left-0 w-6 h-4 bg-emerald-800/30 rounded-full rotate-[-30deg]" />
          <div className="absolute top-1 right-0 w-5 h-3 bg-emerald-700/30 rounded-full rotate-[30deg]" />
          <div className="absolute top-4 left-1 w-4 h-3 bg-emerald-800/25 rounded-full rotate-[-15deg]" />
        </div>
      </div>

      {/* Curtains - on window */}
      <div className="absolute top-4 right-8 w-4 h-56 bg-gradient-to-b from-indigo-900/30 to-indigo-950/40 rounded-b-lg" />
      <div className="absolute top-4 right-[11rem] w-4 h-56 bg-gradient-to-b from-indigo-900/30 to-indigo-950/40 rounded-b-lg" />

      {/* Wall art / Picture frames */}
      <div className="absolute top-24 left-[12%] w-16 h-12 border-2 border-amber-800/30 bg-slate-800/20 rounded-sm" />
      <div className="absolute top-20 left-[28%] w-10 h-14 border-2 border-amber-800/30 bg-slate-800/20 rounded-sm" />

      {/* Floating dust particles for atmosphere */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`dust-${i}`}
          className="absolute w-0.5 h-0.5 bg-white/10 rounded-full animate-float"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${10 + Math.random() * 70}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
};
