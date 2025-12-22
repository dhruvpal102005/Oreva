import { cn } from "@/lib/utils";
import { Shield, Cloud, Code, Lock, Key, Server, Container, FileText } from "lucide-react";

export function FeaturesSectionWithHoverEffects() {
    const features = [
        {
            title: "Open source dependency scanning (SCA)",
            description:
                "Continuously monitors your code for known vulnerabilities, CVE-s and other risks or outdated SBOMs.",
            icon: <Shield className="w-6 h-6" />,
        },
        {
            title: "Cloud posture management (CSPM)",
            description:
                "Detects cloud infrastructure risks (misconfigurations, VMs, Container images) across major cloud providers.",
            icon: <Cloud className="w-6 h-6" />,
        },
        {
            title: "Static code analysis (SAST)",
            description:
                "Scans your source code for security risks before an issue can be merged.",
            icon: <Code className="w-6 h-6" />,
        },
        {
            title: "Secrets detection",
            description:
                "Checks your code for leaked and exposed API keys, passwords, certificates, encryption keys, etc.",
            icon: <Key className="w-6 h-6" />,
        },
        {
            title: "Infrastructure as code scanning (IaC)",
            description: "Scans Terraform, CloudFormation & Kubernetes infrastructure-as-code for misconfigurations.",
            icon: <Server className="w-6 h-6" />,
        },
        {
            title: "Container image scanning",
            description:
                "Scans your container OS for packages with security issues.",
            icon: <Container className="w-6 h-6" />,
        },
        {
            title: "Open source license scanning",
            description:
                "Monitors your licenses for risks such as dual licensing, restrictive terms, bad reputation, etc.",
            icon: <FileText className="w-6 h-6" />,
        },
        {
            title: "Runtime Protection",
            description: "Zero-day & in-app firewall for peace of mind. Auto-block injection attacks, introduce API rate limiting & more.",
            icon: <Lock className="w-6 h-6" />,
        },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
            {features.map((feature, index) => (
                <Feature key={feature.title} {...feature} index={index} />
            ))}
        </div>
    );
}

const Feature = ({
    title,
    description,
    icon,
    index,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}) => {
    return (
        <div
            className={cn(
                "flex flex-col lg:border-r py-10 relative group/feature border-white/10",
                (index === 0 || index === 4) && "lg:border-l border-white/10",
                index < 4 && "lg:border-b border-white/10"
            )}
        >
            {index < 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />
            )}
            {index >= 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
            )}
            <div className="mb-4 relative z-10 px-10 text-purple-400">
                {icon}
            </div>
            <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-white/20 group-hover/feature:bg-purple-500 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-white">
                    {title}
                </span>
            </div>
            <p className="text-sm text-white/60 max-w-xs relative z-10 px-10">
                {description}
            </p>
        </div>
    );
};
