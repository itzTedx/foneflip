import { atom } from "jotai";

import { ZodError } from "@ziron/validators";

export const productErrorAtom = atom<ZodError["issues"]>([]);
