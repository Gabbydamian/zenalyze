"use client";
import { Rocket, Gem, Crown, CheckCircle } from "lucide-react";

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      icon: <Rocket className="w-8 h-8 text-[var(--color-foreground)]" />,
      badge: null,
      subtitle: "Get started for free",
      price: "$0",
      priceSuffix: "/mo",
      button: "Get Started",
      features: [
        "30 entries/mo",
        "3-day history",
        "Basic insights",
        "Community support",
        "Limited integrations",
      ],
    },
    {
      name: "Pro",
      icon: <Gem className="w-8 h-8 text-[var(--color-foreground)]" />,
      badge: (
        <span className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 via-pink-500 to-pink-400 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-sm">
          POPULAR
        </span>
      ),
      subtitle: "For growing users",
      price: "$7",
      priceSuffix: "/mo",
      button: "Try Pro",
      features: [
        "200 entries/mo",
        "30-day history",
        "Advanced insights",
        "Email support",
        "Export & integrations",
        "Everything in Free",
      ],
    },
    {
      name: "Premium",
      icon: <Crown className="w-8 h-8 text-[var(--color-foreground)]" />,
      badge: null,
      subtitle: "Unlock everything",
      price: "$19",
      priceSuffix: "/mo",
      button: "Unlock Premium",
      features: [
        "Unlimited entries",
        "Full insights & analytics",
        "Priority support",
        "Export & integrations",
        "Priority access to new features",
        "Customizable dashboard",
        "Everything in Pro",
      ],
    },
  ];
  return (
    <section id="pricing" className="relative py-20 bg-[var(--color-background)]">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-[var(--color-foreground)]">
          Start free. Upgrade when you're ready.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isPro = plan.name === "Pro";
            return (
              <div
                key={plan.name}
                className="relative flex flex-col h-full bg-white dark:bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-8 items-center text-center"
              >
                {plan.badge}
                <div className="mb-4">{plan.icon}</div>
                <h6 className="text-xl font-bold mb-1 text-[var(--color-foreground)]">
                  {plan.name}
                </h6>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                  {plan.subtitle}
                </p>
                <div className="flex items-end justify-center mb-2">
                  <h6 className="text-4xl font-extrabold text-[var(--color-foreground)]">
                    {plan.price}
                  </h6>
                  <span className="ml-1 text-base text-[var(--color-muted-foreground)] font-[var(--montserrat)]">
                    {plan.priceSuffix}
                  </span>
                </div>
                <button
                  className={
                    isPro
                      ? "w-full mt-2 mb-6 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 transition-colors duration-300 ease-in-out hover:bg-gradient-to-r hover:from-orange-500 hover:via-pink-500 hover:to-pink-400 hover:text-white"
                      : "w-full mt-2 mb-6 py-3 rounded-lg border-2 border-[var(--color-ring)] bg-transparent text-[var(--color-primary)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 transition-colors duration-300 ease-in-out hover:bg-gradient-to-r hover:from-orange-500 hover:via-pink-500 hover:to-pink-400 hover:text-white"
                  }
                >
                  {plan.button}
                </button>
                <div className="w-full border-t border-[var(--color-border)] mb-4" />
                <div className="font-semibold mb-2 text-[var(--color-foreground)]">
                  Features
                </div>
                <ul className="space-y-2 w-full">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center justify-center lg:justify-start gap-2 text-[var(--color-muted-foreground)]"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-left">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex-1" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
