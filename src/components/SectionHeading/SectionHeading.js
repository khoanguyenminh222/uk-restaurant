'use client';

export default function SectionHeading({ title, subtitle, icon: Icon }) {
    return (
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 group transition-all duration-300 hover:bg-primary/20">
                <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 bg-linear-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                {title}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-12 bg-linear-to-r from-transparent to-primary"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <div className="h-px w-12 bg-linear-to-r from-primary to-transparent"></div>
            </div>
            {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
