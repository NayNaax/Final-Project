import { Router } from "express";
import * as watchlistsController from "../controllers/watchlists.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/", watchlistsController.getAllForUser);
router.post("/", watchlistsController.create);
router.patch("/:id", watchlistsController.rename);
router.delete("/:id", watchlistsController.deleteWatchlist);

router.post("/:id/symbols", watchlistsController.addSymbol);
router.delete("/:id/symbols/:symbol", watchlistsController.removeSymbol);

export default router;
