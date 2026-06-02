resource "aws_security_group" "study_sg" {
  name = "study-cafe-sg-tf"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "study_server" {
  ami           = "ami-0fbcf351e82d18381"
  instance_type = var.instance_type

  security_groups = [
    aws_security_group.study_sg.name
  ]

  tags = {
    Name = "VirtualStudyCafe-TF"
  }
}

resource "aws_s3_bucket" "study_bucket" {
  bucket = "virtual-study-cafe-justus-2026-tf"
}

resource "aws_ecr_repository" "backend_repo" {
  name = "virtual-study-backend-tf"
}

resource "aws_ecr_repository" "frontend_repo" {
  name = "virtual-study-frontend-tf"
}
