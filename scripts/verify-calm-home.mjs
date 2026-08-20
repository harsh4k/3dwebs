const work = await (await fetch("http://localhost:3000/work")).text();
const home = await (await fetch("http://localhost:3000/")).text();
const svc = await (await fetch("http://localhost:3000/services")).text();

const out = {
  workHasAbbott: work.includes("case=abbott-smartpack"),
  workHasPalava: work.includes("case=lodha-palava"),
  homeHasCase: home.includes("case=abbott-smartpack"),
  homeHasShowreel: home.includes("showreel"),
  homeNoHealthy: !home.includes("Healthy Blogs"),
  servicesHasIds: svc.includes('id="digital-marketing-strategy"'),
  homeServicesLink: home.includes("/services#"),
};

console.log(out);
if (!Object.values(out).every(Boolean)) process.exit(1);
