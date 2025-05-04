
import { supabase } from "./baseService";
import { Tag } from "../types";

// ====== TAGS ======
export const getTags = async (): Promise<Tag[]> => {
  try {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*');

    if (error) {
      console.error('Erro ao buscar tags:', error);
      return [];
    }

    // Formatando as datas
    return tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      createdAt: new Date(tag.created_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    return [];
  }
};

export const saveTag = async (tag: Tag): Promise<Tag | null> => {
  try {
    // Preparar objeto da tag para o Supabase
    const tagData = {
      id: tag.id,
      name: tag.name
      // Não incluímos created_at pois é gerenciado pelo banco
    };

    // Inserir ou atualizar a tag
    const { data: savedTag, error } = await supabase
      .from('tags')
      .upsert(tagData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar tag:', error);
      return null;
    }

    return {
      id: savedTag.id,
      name: savedTag.name,
      createdAt: new Date(savedTag.created_at)
    };
  } catch (error) {
    console.error('Erro ao salvar tag:', error);
    return null;
  }
};

export const deleteTag = async (tagId: string): Promise<boolean> => {
  try {
    // Excluir tag
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error('Erro ao excluir tag:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir tag:', error);
    return false;
  }
};
