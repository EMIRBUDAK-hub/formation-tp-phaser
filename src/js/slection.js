// chargement des librairies

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/


export default class selection extends Phaser.Scene {

    constructor() {
        super({ key: "selection" }); // mettre le meme nom que le nom de la classe
    }
    preload() {
        this.load.image("img_ciel", "src/assets/sky.png");
        this.load.image("img_plateforme", "src/assets/platform.png")
        this.load.spritesheet("img_perso", "src/assets/dude.png", {
            frameWidth: 32,
            frameHeight: 48
        });
        this.load.image("img_etoile", "src/assets/star.png");
        this.load.image("img_bomb", "src/assets/bomb.png");
        this.load.image('img_porte1', './src/assets/door1.png');
        this.load.image('img_porte2', './src/assets/door2.png');
        this.load.image('img_porte3', './src/assets/door3.png'); 
    }
    create() {
        this.add.image(400, 300, "img_ciel");

        groupe_plateformes = this.physics.add.staticGroup();
        groupe_plateformes.create(200, 584, "img_plateforme");
        groupe_plateformes.create(600, 584, "img_plateforme");
        groupe_plateformes.create(50, 300, "img_plateforme");
        groupe_plateformes.create(600, 450, "img_plateforme");
        groupe_plateformes.create(750, 270, "img_plateforme");

        player = this.physics.add.sprite(100, 450, 'img_perso');
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, groupe_plateformes);
        player.setBounce(0.2);
        clavier = this.input.keyboard.createCursorKeys();
        this.anims.create({
            key: "anim_tourne_gauche", // key est le nom de l'animation : doit etre unique poru la scene.
            frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
            frameRate: 10, // vitesse de défilement des frames
            repeat: -1 // nombre de répétitions de l'animation. -1 = infini
        });
        this.anims.create({
            key: "anim_tourne_droite", // key est le nom de l'animation : doit etre unique poru la scene.
            frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }), // on prend toutes les frames de img perso numerotées de 0 à 3
            frameRate: 10, // vitesse de défilement des frames
            repeat: -1 // nombre de répétitions de l'animation. -1 = infini
        });
        this.anims.create({
            key: "anim_face",
            frames: [{ key: "img_perso", frame: 4 }],
            frameRate: 20
        });


        groupe_etoiles = this.physics.add.group();
        for (var i = 0; i < 10; i++) {
            var coordX = 70 + 70 * i;
            groupe_etoiles.create(coordX, 10, "img_etoile");
        }
        this.physics.add.collider(groupe_etoiles, groupe_plateformes);
        groupe_etoiles.children.iterate(function iterateur(etoile_i) {
            // On tire un coefficient aléatoire de rerebond : valeur entre 0.4 et 0.8
            var coef_rebond = Phaser.Math.FloatBetween(0.4, 0.8);
            etoile_i.setBounceY(coef_rebond); // on attribut le coefficient de rebond à l'étoile etoile_i
        });
        this.physics.add.overlap(player, groupe_etoiles, ramasserEtoile, null, this);
        zone_texte_score = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });


        groupe_bombes = this.physics.add.group();
        this.physics.add.collider(groupe_bombes, groupe_plateformes);



        this.physics.add.collider(player, groupe_bombes, chocAvecBombe, null, this);

         this.porte1 = this.physics.add.staticSprite(600, 414, "img_porte1");
        this.porte2 = this.physics.add.staticSprite(50, 264, "img_porte2");
        this.porte3 = this.physics.add.staticSprite(750, 234, "img_porte3");
 











    }
    update() {
        if (clavier.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('anim_tourne_droite', true);
        }
        else if (clavier.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('anim_tourne_gauche', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('anim_face');
        }
        if (clavier.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
        if (gameOver) {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(clavier.space) == true) {
            if (this.physics.overlap(player, this.porte1)) this.scene.switch("niveau1");
            if (this.physics.overlap(player, this.porte2)) this.scene.switch("niveau2");
            if (this.physics.overlap(player, this.porte3)) this.scene.switch("niveau3");
        } 

    }
}


/*********************************** */
/** GROUPE PLATEFORMES
/************************ */
var groupe_plateformes;



/*********************************** */
/** GROUPE PERSO
/************************ */
var player; // designe le sprite du joueur

/*********************************** */
/** GROUPE deplacement
/************************ */
var clavier;

/*********************************** */
/** GROUPE etoiles
/************************ */
var groupe_etoiles;
function ramasserEtoile(un_player, une_etoile) {
    // on désactive le "corps physique" de l'étoile mais aussi sa texture
    // l'étoile existe alors sans exister : elle est invisible et ne peut plus intéragir
    une_etoile.disableBody(true, true);
    if (groupe_etoiles.countActive(true) === 0) {
        // si ce nombre est égal à 0 : on va réactiver toutes les étoiles désactivées
        // pour chaque étoile etoile_i du groupe, on réacttive etoile_i avec la méthode enableBody
        // ceci s'ecrit bizarrement : avec un itérateur sur les enfants (children) du groupe (equivalent du for)
        groupe_etoiles.children.iterate(function iterateur(etoile_i) {
            etoile_i.enableBody(true, etoile_i.x, 0, true, true);
        });
        var x;
        if (player.x < 400) {
            x = Phaser.Math.Between(400, 800);
        } else {
            x = Phaser.Math.Between(0, 400);
        }

        var une_bombe = groupe_bombes.create(x, 16, "img_bomb");
        une_bombe.setBounce(1);
        une_bombe.setCollideWorldBounds(true);
        une_bombe.setVelocity(Phaser.Math.Between(-200, 200), 20);
        une_bombe.allowGravity = false;
    }
    score += 1;
    zone_texte_score.setText("Score: " + score);
}
/*********************************** */
/** GROUPE score
/************************ */
var score = 0;
var zone_texte_score;
/*********************************** */
/** GROUPE BOMBES
/************************ */

var gameOver = false;
var groupe_bombes;
function chocAvecBombe(un_player, une_bombe) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play("anim_face");
    gameOver = true;
} 
