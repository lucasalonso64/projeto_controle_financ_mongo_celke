//Carregando os módulo
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/CatPagamento")
const CatPagamento = mongoose.model('catpagamento')
require("../models/Pagamento")
const Pagamento = mongoose.model('pagamento')
require("../models/Usuario")
const Usuario = mongoose.model('usuario')

router.get('/', (req, res) => {
    //res.send("Página incial do administrativo")
    res.render("admin/index")
})

router.get('/usuarios', (req, res) => {
    res.render("admin/usuarios")
})

router.get('/cat-pagamentos', (req, res) => {
    CatPagamento.find().then((catpagamento) => {
        res.render("admin/cat-pagamentos", { catpagamentos: catpagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não encontrada!")
        res.render("admin/cat-pagamentos")
    })

})

router.get('/vis-cat-pagamento/:id', (req, res) => {
    CatPagamento.findOne({ _id: req.params.id }).then((catpagamento) => {
        res.render("admin/vis-cat-pagamento", { catpagamento: catpagamento })

    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não encontrada!")
        res.render("admin/cat-pagamentos")
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
        req.flash("error_msg", "Error: Categoria de pagamento não encontrada!")
        res.redirect("admin/cat-pagamento")
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
        req.flash("error_msg", "Error: Categoria de pagamento não encontrada!")
        res.redirect("/admin/cat-pagamentos")
    })
})


router.get('/del-cat-pagamento/:id', (req, res) => {
    CatPagamento.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Categoria de pagamento apagada com sucesso!")
        res.redirect("/admin/cat-pagamentos")

    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não foi apagada!")
        res.redirect("/admin/cat-pagamentos")
    })
})

router.get('/pagamentos', (req, res) => {
    Pagamento.find().populate("catpagamento").then((pagamentos) => {

        res.render("admin/pagamentos", { pagamentos: pagamentos })

    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não encontrado apagada!")
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
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ error: "Necessário preencher o campo nome" })
    }
    if (!req.body.valor || typeof req.body.valor == undefined || req.body.valor == null) {
        erros.push({ error: "Necessário preencher o campo valor" })
    }
    if (!req.body.catpagamento || typeof req.body.catpagamento == undefined || req.body.catpagamento == null) {
        erros.push({ error: "Necessário preencher o campo categoria de pagamento" })
    }

    if (erros.length > 0) {
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
            req.flash("error_msg", "Error: Pagamento não foi cadastrado com sucesso!")
            res.redirect('/admin/cad-pagamento')
        })
    }

})

router.get('/edit-pagamento/:id', (req, res) => {
    // res.render("admin/edit-pagamento")

    Pagamento.findOne({ _id: req.params.id }).populate("catpagamento").then((pagamento) => {
        CatPagamento.find().then((catpagamentos) => {
            res.render("admin/edit-pagamento", { pagamento: pagamento, catpagamentos: catpagamentos })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Não é possível carregar o as categorias de pagamento!")
            res.redirect('/admin/pagamento')

        })


    }).catch((erro) => {
        req.flash("error_msg", "Error: Não é possível carregar o formulário editar pagamento!")
        res.redirect('/admin/pagamento')
    })
})

router.post('/update-pagamento', (req, res) => {
    Pagamento.findOne({ _id: req.body.id }).then((pagamento) => {
        pagamento.nome = req.body.nome,
            pagamento.valor = req.body.valor,
            pagamento.catpagamento = req.body.catpagamento

        pagamento.save().then(() => {
            req.flash("success_msg", "Error: Pagamento editado com sucesso!")
            res.redirect('/admin/pagamentos')

        }).catch((erro) => {
            req.flash("error_msg", "Error: Pagamento não editado com sucesso!")
            res.redirect('/admin/pagamentos')
        })


    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não encontrado!")
        res.redirect('/admin/pagamentos')
    })
})

router.get('/del-pagamento/:id', (req, res) => {
    Pagamento.deleteOne({_id: req.params.id}).then(() =>{
        req.flash("success_msg", "Pagamento apagado com sucesso!")
        res.redirect('/admin/pagamentos')
    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não foi apagado com sucesso!")
        res.redirect('/admin/pagamentos')
    })
})


router.get('/vis-pagamento/:id', (req, res) => {
    Pagamento.findOne({_id: req.params.id}).populate("catpagamento").then((pagamento) => {
        res.render("admin/vis-pagamento", {pagamento: pagamento})
    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não encontrado!")
        res.redirect('/admin/pagamentos')
    })
})


router.get('/cad-usuario', (req, res) => {
    res.render("admin/cad-usuario")
})




//Exportar o módulo de rotas
module.exports = router