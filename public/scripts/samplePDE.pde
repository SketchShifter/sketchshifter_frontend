void setup() {
    size(400, 400);
    background(255);
}

void draw() {
    background(255); 
    translate(width / 2, height / 2); 
    
    float angle = frameCount * 0.05;
    float x = cos(angle) * 100;
    float y = sin(angle) * 100;
    
    fill(0, 0, 255);
    ellipse(x, y, 30, 30);
}