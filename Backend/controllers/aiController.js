import * as ai from '../services/aiService.js'

export const getResult = async (req,res) =>  {
    try {
        const {prompt} = req.query;
        const result = await ai.generateResult(prompt)
        res.send(result) 
        } catch (error) {
        res.status(500).json({message : error.message})
        }
}