void setup() {
    size(600, 600);
    background(255);
    fill(0, 0, 255);
    stroke(255, 0, 0);
}

void draw() {
    translate(width / 2 + 300, height / 2 + 100);
    rotate(180 * 0.01);
    ellipse(30, 40, 100, 200);
}

