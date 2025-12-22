"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import Link from "next/link";
import { Button } from "./button";

function Hero() {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["powerful", "secure", "intelligent", "comprehensive", "automated"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <AuroraBackground>
            <motion.div
                initial={{ opacity: 0.0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="relative flex flex-col gap-8 items-center justify-center px-4"
            >
                <div>
                    <div className="inline-flex items-center gap-4 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 rounded-full text-sm font-semibold transition-all">
                        Trusted by 50K+ organizations <MoveRight className="w-4 h-4" />
                    </div>
                </div>

                <div className="flex gap-4 flex-col items-center">
                    <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-regular">
                        <span className="text-white">Secure everything,</span>
                        <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                            &nbsp;
                            {titles.map((title, index) => (
                                <motion.span
                                    key={index}
                                    className="absolute font-semibold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, y: "-100" }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                    animate={
                                        titleNumber === index
                                            ? {
                                                y: 0,
                                                opacity: 1,
                                            }
                                            : {
                                                y: titleNumber > index ? -150 : 150,
                                                opacity: 0,
                                            }
                                    }
                                >
                                    {title}
                                </motion.span>
                            ))}
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl leading-relaxed tracking-tight text-neutral-200 max-w-3xl text-center">
                        Secure your code, cloud, and runtime in one central system.
                        Find and fix vulnerabilities automatically with AI-powered security scanning.
                    </p>
                </div>

                <Link href="/login">
                    <GradientButton className="gap-4">
                        Start for Free <MoveRight className="w-4 h-4" />
                    </GradientButton>
                </Link>
            </motion.div>
        </AuroraBackground>
    );
}

export { Hero };
