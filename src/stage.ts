import { Handler } from '@botol/dipo';
import { ContextTG, DipoTG } from '@botol/tg-dipo';
import { ContextSession } from '@botol/tg-session';

export class Stage<T extends DipoTG> {
    private scenes: { [key: string]: T } = {};

    constructor(private bot: T) {}

    createScene(name: string): T {
        this.scenes[name] = new DipoTG(this.bot['events']) as T;
        return this.scenes[name];
    }

    middleware(): Handler<
        Partial<ContextSession<{ scenes?: { current?: string } }>> & ContextTG
    > {
        return (ctx, next) => {
            ctx.session!.scenes = { current: void 0 };

            if (ctx.session?.scenes?.current == null) {
                return next();
            }

            if (!this.scenes.hasOwnProperty(ctx.session.scenes.current)) {
                throw new Error(
                    `Scene ${ctx.session.scenes.current} not found`,
                );
            }

            return this.scenes[ctx.session.scenes.current].handle(ctx);
        };
    }
}
