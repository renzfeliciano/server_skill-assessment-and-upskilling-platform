import { Router } from "express"
import AzureAIController from "./controller.js"

const AzureAIRoutes = Router()

AzureAIRoutes
    .get('/generate-industries', AzureAIController.generateIndustries)
    .post('/generate-job-roles-and-level', AzureAIController.generateJobRoles)
    .post('/generate-skillset', AzureAIController.generateSkillset)
    .post('/generate-quiz', AzureAIController.generateQuiz)
    .post('/evaluate-quiz', AzureAIController.evaluateQuiz)
    .post('/generate-platforms', AzureAIController.getPlatforms)
    .post('/generate-learning-path', AzureAIController.generateLearningPath)

export default AzureAIRoutes