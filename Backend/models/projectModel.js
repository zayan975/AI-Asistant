import mongoose from 'mongoose';


const projectSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        unique:[true,'project name already exists']
    },

    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'

        }
    ],
     fileTree: {
        type: Object,
        default: {}
    },
})

const project = mongoose.model('project',projectSchema)

export default project