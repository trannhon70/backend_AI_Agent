const ipinfo = require("ipinfo");

interface BotDefinition {
    name: string;
    orgKeywords: string[];
    hostKeywords: string[];
    uaKeywords: string[];
}

const knownBots: BotDefinition[] = [
    {
        name: "Googlebot",
        orgKeywords: ["google"],
        hostKeywords: ["googlebot.com", "google.com"],
        uaKeywords: ["googlebot"],
    },
    {
        name: "Bingbot",
        orgKeywords: ["microsoft", "bing"],
        hostKeywords: ["search.msn.com", "bing.com"],
        uaKeywords: ["bingbot"],
    },
    {
        name: "Amazonbot",
        orgKeywords: ["amazon"],
        hostKeywords: ["crawl.amazonbot.amazon"],
        uaKeywords: ["amazonbot"],
    },
    {
        name: "DuckDuckBot",
        orgKeywords: ["duckduckgo"],
        hostKeywords: ["duckduckgo.com"],
        uaKeywords: ["duckduckbot"],
    },
];

export async function isKnownBot(ip: string, userAgent: string): Promise<string | null> {
    return new Promise((resolve) => {
        ipinfo(ip, (err: any, data: any) => {
            if (err || !data) return resolve(null);

            const org = data.org?.toLowerCase() || "";
            const hostname = data.hostname?.toLowerCase() || "";
            const ua = userAgent?.toLowerCase() || "";

            for (const bot of knownBots) {
                const matchOrg = bot.orgKeywords.some((k) => org.includes(k));
                const matchHost = bot.hostKeywords.some((k) => hostname.includes(k));
                const matchUA = bot.uaKeywords.some((k) => ua.includes(k));

                if (matchOrg || matchHost || matchUA) {
                    return resolve(bot.name);
                }
            }

            resolve(null);
        });
    });
}
