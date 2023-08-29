import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class UsersController {
  public async index({ request }: HttpContextContract) {
    const page = Number(request.input('page', '1'))
    const limit = 50

    const usersQuery = User.query()
    const usersCount = await usersQuery.clone().count('* as count')
    const users = await usersQuery
      .clone()
      .offset((page - 1) * limit)
      .limit(limit)

    return {
      page_total: Math.ceil(Number(usersCount[0].$extras.count) / limit),
      data: users.map((user) => user.serialize()),
    }
  }

  public async store({ request }: HttpContextContract) {
    const { email, password, fullname, gender, role, birthday, avatar } = await request.validate({
      schema: schema.create({
        email: schema.string({}, [rules.email()]),
        password: schema.string.optional(),
        fullname: schema.string(),
        gender: schema.enum(['male', 'female']),
        role: schema.enum(['administrator', 'teacher', 'student']),
        birthday: schema.date(),
        avatar: schema.file.optional({
          extnames: ['jpg', 'jpeg', 'png'],
          size: '2mb',
        }),
      }),
    })

    const user = new User()
    user.email = email
    user.password = password || email
    user.fullname = fullname
    user.gender = gender
    user.role = role
    user.birthday = birthday

    if (avatar) {
      user.avatar = Attachment.fromFile(avatar)
    }

    await user.save()

    return user.serialize()
  }

  public async update({ request, params }: HttpContextContract) {
    const { email, password, fullname, gender, role, birthday, avatar } = await request.validate({
      schema: schema.create({
        email: schema.string({}, [rules.email()]),
        password: schema.string.optional(),
        fullname: schema.string(),
        gender: schema.enum(['male', 'female']),
        role: schema.enum(['administrator', 'teacher', 'student']),
        birthday: schema.date(),
        avatar: schema.file.optional({
          extnames: ['jpg', 'jpeg', 'png'],
          size: '2mb',
        }),
      }),
    })

    const user = await User.findOrFail(params.id)
    user.email = email
    user.fullname = fullname
    user.gender = gender
    user.role = role
    user.birthday = birthday

    if (avatar) {
      user.avatar = Attachment.fromFile(avatar)
    }

    if (password) {
      user.password = password
    }

    await user.save()

    return user.serialize()
  }
}
