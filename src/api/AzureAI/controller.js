import AzureAIService from "./service.js"
import dotenv from "dotenv"

dotenv.config()

const INDUSTRIES_LIMIT = process.env.INDUSTRIES_LIMIT ?? 10
const ROLES_AND_LEVELS_LIMIT = process.env.ROLES_AND_LEVELS_LIMIT ?? 5
const SKILLSETS_LIMIT = process.env.SKILLSETS_LIMIT ?? 10
const QUIZ_LIMIT = process.env.QUIZ_LIMIT ?? 10
const PLATFORMS_LIMIT = process.env.PLATFORMS_LIMIT ?? 5
const RECOMMENDATIONS_AND_MILESTONES_LIMIT =
  process.env.RECOMMENDATIONS_AND_MILESTONES_LIMIT ?? 5

class AzureAIController {
  async generateIndustries(_req, res, next) {
    try {
      const prompt = `
        Generate a JSON array of ${INDUSTRIES_LIMIT} industries relevant for skill assessment and upskilling. 
        Ensure the industries span diverse sectors like technology, healthcare, finance, education, and retail.
        Do not include any greetings, commentary, or extra text.

        Example:
        [
            "<industry #1>",
            "<industry #2>",
            "<industry #3>"
        ]
    `

      const result = await AzureAIService.processOpenAIRequest(prompt, 300)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async generateJobRoles(req, res, next) {
    try {
      const { industry } = req.body
      const prompt = `
        Generate a JSON array of ${ROLES_AND_LEVELS_LIMIT} high-demand job roles in the ${industry} sector, with their respective career levels. 
        Include only roles relevant to modern career opportunities in this field. Avoid any greetings or commentary.

        Example:
        [
            {
                "role": "<role>",
                "levels": ["<level #1>", "<level #2>", "<level #3>"]
            }
        ]
      `

      const result = await AzureAIService.processOpenAIRequest(prompt, 300)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async generateSkillset(req, res, next) {
    try {
      const { industry, role, level } = req.body
      const prompt = `
        Generate a JSON object with a list of ${SKILLSETS_LIMIT} essential skills for the role "${role}" at the "${level}" level in the "${industry}" industry. 
        Include both technical and soft skills, reflecting today's industry demands. Avoid greetings or extra words.

        Example:
        {
            "skillsNeeded": [
                "<skill #1>",
                "<skill #2>",
                "<skill #3>"
            ]
        }
      `

      const result = await AzureAIService.processOpenAIRequest(prompt, 500)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async generateQuiz(req, res, next) {
    try {
      const { industry, role, level, skillset, learningPath } = req.body
      const { advanced = false } = req.query
      let prompt = ``

      if (advanced) {
        prompt = `
          Generate a ${QUIZ_LIMIT}-question advanced-level multiple-choice quiz based on the following inputs:
          - Industry: ${industry}
          - Role: ${role}
          - Level: ${level}
          - Skillset: ${JSON.stringify(skillset)}
          - Learning Path: ${JSON.stringify(learningPath)}

          Focus the quiz on the areas highlighted in the learning path, addressing knowledge gaps and challenging understanding of real-world scenarios. 
          Return the results in a JSON array format with no extra words.

          Example:
          [
              {
                  "question": "<advanced question>",
                  "options": [
                      "A. <choice A>",
                      "B. <choice B>",
                      "C. <choice C>",
                      "D. <choice D>"
                  ],
                  "correctAnswer": "<letter of correct answer>"
              }
          ]
      `
      } else {
        prompt = `
          Generate a ${QUIZ_LIMIT}-question advanced-level multiple-choice quiz based on the following inputs:
            - Industry: ${industry}
            - Role: ${role}
            - Level: ${level}
            - Skillset: ${JSON.stringify(skillset)}

            Focus the quiz on the areas highlighted in the learning path, addressing knowledge gaps and challenging understanding of real-world scenarios. 
            Return the results in a JSON array format with no extra words.

            Example:
            [
                {
                    "question": "<advanced question>",
                    "options": [
                        "A. <choice A>",
                        "B. <choice B>",
                        "C. <choice C>",
                        "D. <choice D>"
                    ],
                    "correctAnswer": "<letter of correct answer>"
                }
            ]
        `
      }

      const result = await AzureAIService.processOpenAIRequest(prompt, 1500)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async evaluateQuiz(req, res, next) {
    try {
      const { userAnswers, quizData, learningPath } = req.body
      const { advanced = false } = req.query
      let score = 0
      const feedback = quizData.map((quizItem, index) => {
        const userAnswer = userAnswers[index] || null
        const isCorrect = userAnswer === quizItem.correctAnswer

        if (isCorrect) score++

        return {
          question: quizItem.question,
          options: quizItem.options,
          correctAnswer: quizItem.correctAnswer,
          userAnswer,
          isCorrect,
          feedback: isCorrect
            ? "Correct!"
            : `Incorrect. The correct answer is '${quizItem.correctAnswer}'.`,
        }
      })

      const correctQuestions = feedback
        .filter((item) => item.isCorrect)
        .map((item) => item.question)
      const incorrectQuestions = feedback
        .filter((item) => !item.isCorrect)
        .map((item) => item.question)

      let prompt = ``

      if (advanced) {
        prompt = `
                    You are a quiz evaluator tasked with performing a detailed SWOT analysis based on the user's advanced quiz performance.
                    The user has been focused on the following learning path: ${JSON.stringify(
                      learningPath
                    )}. Analyze the user's performance in light of these learning areas and provide the following feedback:
                    - Strengths: Areas where the user excelled and correctly answered complex questions.
                    - Weaknesses: Areas where the user made mistakes or struggled, especially in areas related to the learning path.
                    - Opportunities: Suggest how the user can further develop their skills based on the learning path.
                    - Threats: Identify critical gaps that should be addressed for the user's growth.

                    Provide actionable insights to guide the user’s continued learning journey.
                    Please return the results in a JSON array format, without any extra words such as greetings.

                    Please return a response in the following JSON format:
                    {
                        "swotAnalysis": {
                            "strengths": [...],
                            "weaknesses": [...],
                            "opportunities": [...],
                            "threats": [...]
                        }
                    }
                `
      } else {
        prompt = `
                    You are a professional quiz evaluator tasked with performing a SWOT analysis of the user's performance:
                    - **Strengths**: Identify areas where the user consistently demonstrated proficiency.
                    - **Weaknesses**: Highlight topics or concepts the user struggled with.
                    - **Opportunities**: Recommend specific areas for improvement or further development.
                    - **Threats**: Point out critical knowledge gaps that may hinder progress.
        
                    User's Performance:
                    - Correctly Answered Questions: ${JSON.stringify(
                      correctQuestions
                    )}
                    - Incorrectly Answered Questions: ${JSON.stringify(
                      incorrectQuestions
                    )}
        
                    Provide actionable insights to guide the user’s continued learning journey.
                    Please return the results in a JSON array format, without any extra words such as greetings.

                    Please return a response in the following JSON format:
                    {
                        "swotAnalysis": {
                            "strengths": [...],
                            "weaknesses": [...],
                            "opportunities": [...],
                            "threats": [...]
                        }
                    }
                `
      }

      const aiResponse = await AzureAIService.processOpenAIRequest(
        prompt,
        2000
      )
      const result = {
        totalQuestions: quizData.length,
        score: `${score}/${quizData.length}`,
        feedback,
        swotAnalysis: aiResponse?.swotAnalysis || {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: [],
        },
      }

      res.status(200).json(result)
    } catch (error) {
      console.error("Error evaluating quiz:", error)
      next(error)
    }
  }

  async getPlatforms(req, res, next) {
    try {
      const { industry, role, level, subscription } = req.body

      const prompt = `
                You are tasked with recommending online learning platforms tailored to specific industries and roles. 
                Based on the input:
                - **Industry**: ${industry}
                - **Role**: ${role}
                - **Level**: ${level}
                - **Subscription Preference**: ${subscription} (either "free" or "paid"),
                Provide a list of platforms that offer courses, tutorials, certifications, or learning content tailored to the given role. Ensure that the platforms prioritize learning materials specific to the needs and skills required for the role (e.g., for a Cloud Engineer, focus on cloud computing, architecture, certifications, and hands-on labs). 
                The platforms should cater to various experience levels (entry, intermediate, advanced) and offer resources relevant to the role, including but not limited to, professional development, certifications, and hands-on practice. Limit the list to ${PLATFORMS_LIMIT} platforms.
                Ensure that the platforms are suitable for a range of users, from beginners to experienced professionals, and cover a broad spectrum of learning needs specific to the role. Respond only in the following JSON array format:
                [
                    "<platform #1>",
                    "<platform #2>",
                    "<platform #3>",
                    "so on..."
                ]
            `

      const result = await AzureAIService.processOpenAIRequest(prompt, 500)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async generateLearningPath(req, res, next) {
    try {
        const {
            score,
            industry,
            role,
            swotAnalysis,
            platforms,
            skillLevel,
            timeAvailablePerWeek,
            durationInWeeks,
        } = req.body

        const prompt = `
            You are tasked with creating a personalized learning path for a user based on their details:
            - **Industry**: ${industry}
            - **Role**: ${role}
            - **Score**: ${score}
            - **SWOT Analysis**: ${swotAnalysis}
            - **Skill Level**: ${skillLevel}
            - **Time Available per Week**: ${timeAvailablePerWeek} hours
            - **Duration**: ${durationInWeeks} weeks
            - **Preferred Platforms**: ${platforms}

            **Objective**:
            Create a detailed personalized learning path that includes:
            1. **Recommendations**:
                - Provide a list of recommended courses or resources tailored to the user's role, industry, and skill level.
                - For each recommendation, include the platform, estimated duration (in weeks), and a milestone for completion.
                - The recommendation should be aligned with areas of improvement identified in the SWOT analysis.
            2. **Weekly Breakdown**:
                - For each recommendation, provide a detailed weekly plan outlining what the user should do each week. 
                - Ensure the tasks fit within the user's available learning time (${timeAvailablePerWeek} hours/week).
                - The weekly breakdown should cover the duration of the course or resource, with actionable goals for each week.

            **Format**:
            Return the response in the following JSON structure:
            {
                "learningPath": {
                    "recommendations": [
                        {
                            "course": "Course Name",
                            "platform": "Platform Name",
                            "duration": "X weeks",
                            "milestone": "Milestone or goal after completing this course",
                            "weeklyPlan": [
                                {
                                    "week": 1,
                                    "tasks": [
                                        "Task 1",
                                        "Task 2"
                                    ]
                                },
                                {
                                    "week": 2,
                                    "tasks": [
                                        "Task 1",
                                        "Task 2"
                                    ]
                                }
                            ]
                        },
                        ...
                    ]
                }
            }

            **Example Output**:
            {
                "learningPath": {
                    "recommendations": [
                        {
                            "course": "JavaScript for Beginners",
                            "platform": "Codecademy",
                            "duration": "2 weeks",
                            "milestone": "Complete basic JavaScript concepts and syntax.",
                            "weeklyPlan": [
                                {
                                    "week": 1,
                                    "tasks": [
                                        "Complete module 1 of 'JavaScript for Beginners'",
                                        "Practice JavaScript basics (variables, loops, and functions)."
                                    ]
                                },
                                {
                                    "week": 2,
                                    "tasks": [
                                        "Complete module 2 of 'JavaScript for Beginners'",
                                        "Build a small project using JavaScript basics."
                                    ]
                                }
                            ]
                        },
                        {
                            "course": "Data Structures and Algorithms",
                            "platform": "Coursera",
                            "duration": "1 week",
                            "milestone": "Understand and implement basic data structures and algorithms.",
                            "weeklyPlan": [
                                {
                                    "week": 1,
                                    "tasks": [
                                        "Complete the 'Introduction to Data Structures' module.",
                                        "Practice implementing arrays and linked lists."
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }

            **Important Notes**:
            - Ensure recommendations and tasks fit within the user's skill level, role, and time availability.
            - Align the learning path with areas of improvement from the SWOT analysis.
            - Prioritize actionable and measurable goals in each weekly breakdown.
        `

        const result = await AzureAIService.processOpenAIRequest(prompt, 1500)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
  }
}

export default new AzureAIController()
