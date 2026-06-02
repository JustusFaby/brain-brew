pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git branch: 'main',
                url: 'https://github.com/JustusFaby/brain-brew.git'
            }
        }
        stage('Build') {
            steps {
                sh 'docker compose build'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d'
            }
        }
    }
}
