//Carregando os módulo
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
require("../models/CatPagamento")
const CatPagamento = mongoose.model('catpagamento')
require("../models/Pagamento")
const Pagamento = mongoose.model('pagamento')
require("../models/Usuario")
const Usuario = mongoose.model('usuario')
const passport = require('passport')

router.get('/', (req, res) => {
    //res.send("Página incial do administrativo")
    res.render("admin/index")
})

router.get('/usuarios', (req, res) => {
    const { page = 1 } = req.query
    Usuario.paginate({}, { page, limit: 2 }).then((usuario) => {
        console.log(usuario)
        res.render("admin/usuarios", { usuarios: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.redirect("/admin/usuarios")
    })
})

router.get('/cad-usuario', (req, res) => {
    res.render("admin/cad-usuario")
})

router.post('/add-usuario', (req, res) => {
    var dados_usuario = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Erro: Necessário preencher o campo nome!" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ error: "Erro: Necessário preencher o campo e-mail!" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo senha!" })
    }
    if (!req.body.rep_senha || typeof req.body.rep_senha == undefined || req.body.rep_senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo repetir senha!" })
    }
    if (req.body.senha != req.body.rep_senha) {
        errors.push({ error: "Erro: As senhas são diferentes!" })
    }
    if (req.body.senha.length < 6) {
        errors.push({ error: "Erro: Senha muito fraca!" })
    }

    if (errors.length > 0) {
        res.render("admin/cad-usuario", { errors: errors, usuario: dados_usuario })
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Error: Este e-mail já está cadastrado!")
                res.redirect("/admin/cad-usuario")
            } else {
                const addUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcryptjs.genSalt(10, (erro, salt) => {
                    bcryptjs.hash(addUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Error: Não foi possível cadastrar, entre em contato com o administrador!")
                            res.redirect("/admin/cad-usuario")
                        } else {
                            addUsuario.senha = hash
                            addUsuario.save().then(() => {
                                req.flash("success_msg", "Usuário cadastrado com sucesso!")
                                res.redirect('/admin/usuarios')
                            }).catch((erro) => {
                                req.flash("error_msg", "Error: Usuário não foi cadastrado com sucesso!")
                                res.render("admin/cad-usuario")
                            })
                        }
                    })
                })
            }
        }).catch((erro) => {
            req.flash("error_msg", "Error: Não foi possível cadastrar, entre em contato com o administrador!")
            res.render("admin/usuarios")
        })
    }
})

router.get('/cat-pagamentos', (req, res) => {
    CatPagamento.find().then((catpagamento) => {
        res.render("admin/cat-pagamentos", { catpagamentos: catpagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não encontrado!")
        res.render("admin/cat-pagamentos")
    })
})

router.get('/vis-cat-pagamento/:id', (req, res) => {
    CatPagamento.findOne({ _id: req.params.id }).then((catpagamento) => {
        res.render("admin/vis-cat-pagamento", { catpagamento: catpagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não encontrado!")
        res.render("admin/cat-pagamentos")
    })
})

router.get('/vis-usuario/:id', (req, res) => {
    Usuario.findOne({ _id: req.params.id }).then((usuario) => {
        res.render('admin/vis-usuario', { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.redirect("/admin/usuarios")
    })
})


router.get('/cad-cat-pagamento', (req, res) => {
    res.render("admin/cad-cat-pagamento")
})

router.post('/add-cat-pagamento', (req, res) => {
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Necessário preencher o campo nome!" })
    }

    if (errors.length > 0) {
        res.render("admin/cad-cat-pagamento", { errors: errors })
    } else {
        const addCatPagamento = {
            nome: req.body.nome
        }
        new CatPagamento(addCatPagamento).save().then(() => {
            req.flash("success_msg", "Categoria de pagamento cadastrado com sucesso!")
            res.redirect('/admin/cat-pagamentos')
        }).catch((erro) => {
            req.flash("error_msg", "Error: Categoria de pagamento não foi  cadastrada com sucesso!")
        })
    }
})

router.get('/edit-cat-pagamento/:id', (req, res) => {
    CatPagamento.findOne({ _id: req.params.id }).then((catpagamento) => {
        res.render("admin/edit-cat-pagamento", { catpagamento: catpagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não encontrado!")
        res.redirect("/admin/cat-pagamentos")
    })

})

router.post('/update-cat-pagamento', (req, res) => {
    CatPagamento.findOne({ _id: req.body.id }).then((catpagamento) => {
        catpagamento.nome = req.body.nome
        catpagamento.save().then(() => {
            req.flash("success_msg", "Categoria de pagamento editada com sucesso!")
            res.redirect("/admin/cat-pagamentos")
        }).catch((erro) => {
            req.flash("error_msg", "Error: Categoria de pagamento não foi editada com sucesso!")
            res.redirect("/admin/cat-pagamentos")
        })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não encontrado!")
        res.redirect("/admin/cat-pagamentos")
    })
})

router.get('/del-cat-pagamento/:id', (req, res) => {
    CatPagamento.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Categoria de pagamento apagada com sucesso!")
        res.redirect("/admin/cat-pagamentos")
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não foi apagado com sucesso!")
        res.redirect("/admin/cat-pagamentos")
    })
})

router.get('/pagamentos', (req, res) => {
    Pagamento.find().populate("catpagamento").then((pagamentos) => {
        res.render("admin/pagamentos", { pagamentos: pagamentos })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não encontrado!")
        res.render("admin/pagamentos")
    })

})

router.get('/vis-pagamento/:id', (req, res) => {
    Pagamento.findOne({ _id: req.params.id }).populate("catpagamento").then((pagamento) => {
        res.render("admin/vis-pagamento", { pagamento: pagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não encontrado!")
        res.render("admin/pagamentos")
    })
})

router.get('/cad-pagamento', (req, res) => {
    CatPagamento.find().then((catpagamento) => {
        res.render("admin/cad-pagamento", { catpagamentos: catpagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: O formulário cadastrar pagamento não pode ser carregado!")
        res.redirect("/admin/pagamentos")
    })

})

router.post('/add-pagamento', (req, res) => {
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Necessário preencher o campo nome" })
    }
    if (!req.body.valor || typeof req.body.valor == undefined || req.body.valor == null) {
        errors.push({ error: "Necessário preencher o campo valor" })
    }
    if (!req.body.catpagamento || typeof req.body.catpagamento == undefined || req.body.catpagamento == null) {
        errors.push({ error: "Necessário preencher o campo categoria de pagamento" })
    }

    if (errors.length > 0) {
        res.render("admin/cad-pagamento", { errors: errors })
    } else {
        const addPagamento = {
            nome: req.body.nome,
            valor: req.body.valor,
            catpagamento: req.body.catpagamento
        }
        new Pagamento(addPagamento).save().then(() => {
            req.flash("success_msg", "Pagamento cadastrado com sucesso!")
            res.redirect('/admin/pagamentos')
        }).catch((erro) => {
            req.flash("error_msg", "Error: Pagamento não foi cadastrado com sucesso")
            res.redirect('/admin/cad-pagamento')
        })
    }

})

router.get('/edit-pagamento/:id', (req, res) => {
    Pagamento.findOne({ _id: req.params.id }).populate("catpagamento").then((pagamento) => {
        CatPagamento.find().then((catpagamentos) => {
            res.render("admin/edit-pagamento", { pagamento: pagamento, catpagamentos: catpagamentos })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Não foi possível carregar as categorias de pagamentos!")
            res.redirect('/admin/pagamentos')
        })


    }).catch((erro) => {
        req.flash("error_msg", "Error: Não é possível carregar o formulário editar pagamento!")
        res.redirect('/admin/pagamentos')
    })
})

router.post('/update-pagamento', (req, res) => {
    Pagamento.findOne({ _id: req.body.id }).then((pagamento) => {
        pagamento.nome = req.body.nome,
            pagamento.valor = req.body.valor,
            pagamento.catpagamento = req.body.catpagamento

        pagamento.save().then(() => {
            req.flash("success_msg", "Pagamento editado com sucesso!")
            res.redirect('/admin/pagamentos')
        }).catch((erro) => {
            req.flash("error_msg", "Error: Pagamento não foi editado com sucesso!")
            res.redirect('/admin/pagamentos')
        })

    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não encontrado!")
        res.redirect('/admin/pagamentos')
    })
})

router.get('/del-pagamento/:id', (req, res) => {
    Pagamento.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Pagamento apagado com sucesso!")
        res.redirect('/admin/pagamentos')
    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não foi apagado com sucesso!")
        res.redirect('/admin/pagamentos')
    })
})


router.get('/edit-usuario/:id', (req, res) => {
    Usuario.findOne({ _id: req.params.id }).then((usuario) => {
        res.render("admin/edit-usuario", { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.render("admin/usuarios")
    })
})

router.post('/update-usuario', (req, res) => {
    var dados_usuario = req.body
    var errors = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Erro: Necessário preencher o campo nome!" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ error: "Erro: Necessário preencher o campo e-mail!" })
    }
    if (errors.length > 0) {
      //  console.log(dados_usuario)
        res.render("admin/edit-usuario", {errors: errors, usuario: dados_usuario})

    } else {
        Usuario.findOne({ _id: req.body._id }).then((usuario) => {
            usuario.nome = req.body.nome
            usuario.email = req.body.email

            usuario.save().then(() => {
                req.flash("success_msg", "Error: Usuário editado com sucesso!")
                res.redirect("/admin/usuarios")

            }).catch((errors) => {
                req.flash("error_msg", "Error: Usuário não editado com sucesso!")
                res.redirect("/admin/usuarios")
            })

        }).catch((errors) => {
            req.flash("error_msg", "Error: Usuário não encontrado!")
            res.redirect("/admin/usuarios")
        })
    }
})

router.get('/del-usuario/:id', (req, res) => {
    Usuario.deleteOne({ _id: req.params.id}).then(() => {
        req.flash("success_msg", "Error: Usuário apagado com sucesso!")
        res.redirect("/admin/usuarios")

    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não apagado!")
        res.redirect("/admin/usuarios")
    })

})

router.get('/login', (req, res) => {
    res.render("admin/login")
})

router.post('/login', (req, res, next) =>{
    passport.authenticate("local", {
        successRedirect: "/admin/",
        failureRedirect: "/admin/login",
        failureFlash: true
    })(req, res, next)
})



//Exportar o módulo de rotas
module.exports = router