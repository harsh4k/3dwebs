/** Mounts the background full-screen. Nothing else. */

import { mountCoffeeBackground } from "../src";

const container = document.querySelector<HTMLElement>("#background");
if (!container) throw new Error("#background missing");

mountCoffeeBackground(container);
