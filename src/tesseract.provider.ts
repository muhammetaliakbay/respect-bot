import { Injectable } from "@nestjs/common"
import * as Tesseract from "tesseract.js"
import { ConfigProvider } from "./config.provider"
import { InstancePool } from "./instance-pool"

@Injectable()
export class TesseractProvider extends InstancePool<Tesseract.Worker> {
    constructor(
        readonly config: ConfigProvider,
    ) {
        super(
            config.tesseractInstances,
            async () => {
                const worker = Tesseract.createWorker()
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                return worker
            },
        )
    }
}
