var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

var player;
var platforms;
var cursors;

function preload() {
  this.load.image("sky", "src/assets/sky.png");
  this.load.image("ground", "src/assets/platform.png");
  this.load.image("star", "src/assets/star.png");
  this.load.image("bomb", "src/assets/bomb.png");
  this.load.spritesheet("dude", "src/assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.image("bullet", "src/assets/balle.png");
  this.load.image("cible", "src/assets/cible.png");
}

function create() {
  this.add.image(400, 300, "sky");

  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  player = this.physics.add.sprite(100, 450, "dude");
  player.setBounce(0.3);

  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, platforms);
  // creation d'un attribut direction pour le joueur, initialisée avec 'right'
  player.direction = 'right';

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // création du clavier - code déja présent sur le jeu de départ
  cursors = this.input.keyboard.createCursorKeys();

  // affectation de la touche A à boutonFeu
  boutonFeu = this.input.keyboard.addKey('A');
  // création d'un groupe d'éléments vide
  groupeBullets = this.physics.add.group();
  // ajout de 8 cibles espacées de 110 pixels
  cibles = this.physics.add.group({
    key: 'cible',
    repeat: 7,
    setXY: { x: 24, y: 0, stepX: 107 }
  });
  // ajout du modèle de collision entre cibles et plate-formes
  this.physics.add.collider(cibles, platforms);
  this.physics.add.overlap(groupeBullets, cibles, hit, null, this);
  // modification des cibles créées
  cibles.children.iterate(function (cibleTrouvee) {
    // définition de points de vie
    cibleTrouvee.pointsVie = Phaser.Math.Between(1, 5);;
    // modification de la position en y
    cibleTrouvee.y = Phaser.Math.Between(10, 250);
    // modification du coefficient de rebond
    cibleTrouvee.setBounce(1);
    // instructions pour les objets surveillés en bord de monde
    this.physics.world.on("worldbounds", function (body) {
      // on récupère l'objet surveillé
      var objet = body.gameObject;
      // s'il s'agit d'une balle
      if (groupeBullets.contains(objet)) {
        // on le détruit
        objet.destroy();
      }
    });
  }, this);  
};  

function update() {
  if (cursors.left.isDown) {
    player.direction = 'left';
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.direction = 'right';
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
  // déclenchement de la fonction tirer() si appui sur boutonFeu 
  if (Phaser.Input.Keyboard.JustDown(boutonFeu)) {
    tirer(player);
  }
}
var cibles;

var boutonFeu;
//fonction tirer( ), prenant comme paramètre l'auteur du tir

// mise en place d'une variable groupeBullets
var groupeBullets;
function tirer(player) {
  var coefDir;
  if (player.direction == 'left') { coefDir = -1; } else { coefDir = 1 }
  // on crée la balle a coté du joueur
  var bullet = groupeBullets.create(player.x + (25 * coefDir), player.y - 4, 'bullet');
  // parametres physiques de la balle.
  bullet.setCollideWorldBounds(true);
  // on acive la détection de l'evenement "collision au bornes"
  bullet.body.onWorldBounds = true;
  bullet.body.allowGravity = false;
  bullet.setVelocity(1000 * coefDir, 0); // vitesse en x et en y
  // mise en place d'une variable groupeCibles
}
var groupeCibles;
// fonction déclenchée lorsque uneBalle et uneCible se superposent
function hit(uneBalle, uneCible) {
  uneCible.pointsVie--;
  if (uneCible.pointsVie == 0) {
    uneCible.destroy();
  }
  uneBalle.destroy();
}

