const express=require('express')
const router=new express.Router()
const tasks= require('../models/tasks')
const auth = require('../middleware/auth')

module.exports=router
router.post('/tasks',auth,async(req,res)=>{
    // const task=new tasks(req.body)
   const task = new tasks({
     ...req.body,
     owner: req.user._id

   })



  try{ await task.save()
    res.status(201).send(task)
  
  } catch(e){
    res.send(400).send(e)
  }
  
   
     
  })
  // GET /task?completed=true
  // GET task?limit=10&skip=2
  // GET /task?sortBy=createdAt:desc
router.get('/tasks',auth,async(req,res)=>{
    
   // const tasks1= await tasks.find({owner:req.user._id})
   const match ={}
   const sort ={}
   if(req.query.completed){
     match.completed=req.query.completed==='true'
   }
   if(req.query.sortBy){
     const parts = req.query.sortBy.split(':')
     sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
   }
  
  try{ 
     
      await req.user.populate({
        path:'tasks',
      match,
      options:{
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort
      }
      }).execPopulate()
      res.send(req.user.tasks)
    }catch(e){
      res.status(500).send()
    }
      
  })
  router.get('/tasks/:id',auth,async(req,res)=>{
    const _id=req.params.id
    try{
      // const task=await tasks.findById(_id)
      const task = await tasks.findOne({_id,owner :req.user._id})
      res.send(task)
    }catch(e){
      res.status(505).send()
    }
    
  })
  
  router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['task','completed']
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update))
    if(!isValidOperation){
      return res.status(400).send({error:'Invalid Update!'})
    }
    try{
      const task = await tasks.findOne({_id:req.params.id,owner:req.user._id})
      // const task= await tasks.findById(req.params.id)
     
  if(!task){
    return res.status(404).send()
  } 
  updates.forEach((update)=>
       task[update]=req.body[update]
     )
     await task.save()
  res.send(task) 
   }catch(e){
     res.status(400).send(e)
   }
  })
  
  router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
      // const task = await tasks.findByIdAndDelete(req.params.id)
      const task= await tasks.findOneAndDelete({_id:req.params.id,owner:req.user._id})
      if(!task){
        res.status(404).send()
      }
      res.send(task)
    }catch(e){
    res.status(500).send()
    }
  })
  