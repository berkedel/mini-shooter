
import { _decorator, Component, Node, view, tween, v3, easing, UITransform, ParticleSystem2D, Sprite, Vec3, Label, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property(Label)
    private scoreLabel: Label = null;

    @property(Node)
    private playerNode: Node = null;

    @property(Node)
    private enemyNode: Node = null;

    @property(Node)
    private boomNode: Node = null;

    private isFire: boolean = false;
    private score: number = 0;

    protected onLoad() {
        this.placePlayer();
        this.placeEnemy();
        this.node.on(Node.EventType.TOUCH_START, this.fire, this);
    }

    protected onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.fire, this);
    }

    protected update(dt: number) {
        let playerSize = this.playerNode.getComponent(UITransform);
        let enemySize = this.enemyNode.getComponent(UITransform);

        let diff = Vec3.subtract(v3(), this.playerNode.position, this.enemyNode.position);
        if (Vec3.len(diff) < playerSize.width / 2 + enemySize.width / 2) {
            this.enemyNode.active = false;
            this.playerNode.active = false;
            let enemySprite = this.enemyNode.getComponent(Sprite);
            this.boom(this.enemyNode.position, enemySprite.color);

            this.scoreLabel.string = `${++this.score}`;

            this.resetEnemy();
            this.resetPlayer();
        }
    }

    private placeEnemy() {
        this.enemyNode.active = true;
        let winSize = view.getVisibleSize();
        let enemySize = this.enemyNode.getComponent(UITransform);
        let x = winSize.width / 2 - enemySize.width / 2;
        let y = Math.random() * winSize.height / 4;
        let duration = 0.6 + Math.random() * 0.5;

        this.enemyNode.setPosition(0, winSize.height / 3 - enemySize.height / 2);

        tween(this.enemyNode)
            .repeatForever(
                tween()
                    .to(duration, { position: v3(-x, y) }, { easing: easing.linear })
                    .to(duration, { position: v3(x, y) }, { easing: easing.linear })
            )
            .start();
    }

    private resetEnemy() {
        Tween.stopAllByTarget(this.enemyNode);
        this.placeEnemy();
    }

    private resetPlayer() {
        Tween.stopAllByTarget(this.playerNode);
        this.placePlayer();
    }

    private placePlayer() {
        this.isFire = false;

        this.playerNode.active = true;

        let winSize = view.getVisibleSize();
        let playerPos = this.playerNode.position;
        this.playerNode.setPosition(playerPos.x, -winSize.y / 4);

        let playerSize = this.playerNode.getComponent(UITransform);
        tween(this.playerNode)
            .to(10, { position: v3(playerPos.x, -(winSize.y / 2 - playerSize.height)) }, { easing: easing.linear })
            .call(this.die.bind(this))
            .start();
    }

    private fire() {
        if (this.isFire) return;

        this.isFire = true;

        let winSize = view.getVisibleSize();
        tween(this.playerNode)
            .to(0.6, { position: v3(0, winSize.height / 2) }, { easing: easing.linear })
            .call(this.die.bind(this))
            .start();
    }

    private die() {
        this.playerNode.active = false;
        this.boom(this.playerNode.position, this.playerNode.getComponent(Sprite).color);

        setTimeout(() => {
            this.resetEnemy();
            this.resetPlayer();
        }, 1000);
    }

    private boom(pos, color) {
        this.boomNode.setPosition(pos);
        let particle = this.boomNode.getComponent(ParticleSystem2D);
        if (color !== undefined) {
            particle.startColor = particle.endColor = color;
        }
        particle.resetSystem();
    }
}
